import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "../config/db";

const MAX_ATTEMPTS = 5;
const EXPIRY_MINUTES = 5;

// ---------------------------------------------------------------------------
// In-memory fallback store (used when DB is not configured in dev)
// ---------------------------------------------------------------------------
interface MemRecord {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
  createdAt: Date;
}

const memStore = new Map<string, MemRecord>(); // keyed by userId — one active code per admin

function isDbAvailable(): boolean {
  return !!(
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("USER:PASSWORD") &&
    !process.env.DATABASE_URL.includes("localhost:5432/cognify") // placeholder check
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export class TwoFactorService {
  /**
   * Generates a cryptographically secure 6-digit numeric code.
   * Returns the plaintext code (to be logged server-side ONLY) and its bcrypt hash.
   */
  static async generateCode(): Promise<{ plainCode: string; codeHash: string }> {
    // crypto.randomInt is CSPRNG — safe for auth codes
    const plainCode = String(crypto.randomInt(100000, 999999));
    const codeHash = await bcrypt.hash(plainCode, 10);
    return { plainCode, codeHash };
  }

  /**
   * Persists a new 2FA code record for the given admin user.
   * Replaces any existing record for that user (one active code at a time).
   */
  static async createRecord(userId: string, codeHash: string): Promise<void> {
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    if (isDbAvailable()) {
      try {
        // Delete any existing unused codes for this user
        await db.adminTwoFactorCode.deleteMany({ where: { userId } });

        await db.adminTwoFactorCode.create({
          data: { userId, codeHash, expiresAt },
        });
        return;
      } catch (err) {
        console.warn("[TwoFactorService] DB write failed, falling back to memory store:", err);
      }
    }

    // In-memory fallback
    const id = "mem-2fa-" + crypto.randomBytes(8).toString("hex");
    memStore.set(userId, {
      id,
      userId,
      codeHash,
      expiresAt,
      attempts: 0,
      isUsed: false,
      createdAt: new Date(),
    });
  }

  /**
   * Verifies the submitted plaintext code against the stored hash.
   *
   * Possible outcomes:
   *  - Returns `true` on success (marks record as used)
   *  - Throws descriptive errors for: expired, locked, invalid code
   */
  static async verifyCode(userId: string, plainCode: string): Promise<true> {
    if (isDbAvailable()) {
      try {
        return await TwoFactorService._verifyDb(userId, plainCode);
      } catch (err: any) {
        // Re-throw domain errors; fall back to memory only for DB connectivity errors
        const domainErrors = ["expired", "locked", "Invalid", "No active"];
        if (domainErrors.some((msg) => err.message?.includes(msg))) throw err;
        console.warn("[TwoFactorService] DB verify failed, falling back to memory store.");
      }
    }

    return TwoFactorService._verifyMem(userId, plainCode);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private static async _verifyDb(userId: string, plainCode: string): Promise<true> {
    const record = await db.adminTwoFactorCode.findFirst({
      where: { userId, isUsed: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw new Error("No active verification code found. Please request a new one.");
    }

    if (new Date() > record.expiresAt) {
      await db.adminTwoFactorCode.delete({ where: { id: record.id } });
      throw new Error("Verification code has expired. Please request a new one.");
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      throw new Error(
        "Too many failed attempts. Please log in again to request a new code."
      );
    }

    const isMatch = await bcrypt.compare(plainCode, record.codeHash);

    if (!isMatch) {
      await db.adminTwoFactorCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = MAX_ATTEMPTS - record.attempts - 1;
      throw new Error(
        remaining > 0
          ? `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : "Too many failed attempts. Please log in again to request a new code."
      );
    }

    // Mark as used (single-use)
    await db.adminTwoFactorCode.update({
      where: { id: record.id },
      data: { isUsed: true },
    });

    return true;
  }

  private static async _verifyMem(userId: string, plainCode: string): Promise<true> {
    const record = memStore.get(userId);

    if (!record || record.isUsed) {
      throw new Error("No active verification code found. Please request a new one.");
    }

    if (new Date() > record.expiresAt) {
      memStore.delete(userId);
      throw new Error("Verification code has expired. Please request a new one.");
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      throw new Error(
        "Too many failed attempts. Please log in again to request a new code."
      );
    }

    const isMatch = await bcrypt.compare(plainCode, record.codeHash);

    if (!isMatch) {
      record.attempts += 1;
      const remaining = MAX_ATTEMPTS - record.attempts;
      throw new Error(
        remaining > 0
          ? `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
          : "Too many failed attempts. Please log in again to request a new code."
      );
    }

    // Mark as used
    record.isUsed = true;
    return true;
  }

  /** Removes expired records from DB and memory (call periodically or on startup). */
  static async cleanupExpired(): Promise<void> {
    const now = new Date();

    if (isDbAvailable()) {
      try {
        await db.adminTwoFactorCode.deleteMany({ where: { expiresAt: { lt: now } } });
      } catch {
        // Non-critical
      }
    }

    for (const [userId, record] of memStore.entries()) {
      if (record.expiresAt < now) memStore.delete(userId);
    }
  }
}
