import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";
import { RegisterInput, LoginInput } from "../validators/authValidator";
import { env } from "../config/env";
import { db } from "../config/db";
import { TwoFactorService } from "./twoFactorService";
import { TempTokenService } from "./tempTokenService";

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await UserRepository.findByEmail(input.email);
    if (existing) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await UserRepository.create({
      ...input,
      password: hashedPassword,
    });

    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    // Persist refresh token
    try {
      await db.user.update({ where: { id: user.id }, data: { refreshToken } });
    } catch {
      // No DB – skip
    }

    return { user, token, refreshToken };
  }

  static async createAdminUser(email: string, password: string, name?: string) {
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserRepository.create({
      email,
      password: hashedPassword,
      name,
      role: "ADMIN",
    });

    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    try {
      await db.user.update({ where: { id: user.id }, data: { refreshToken } });
    } catch {
      // No DB – skip
    }

    return { user, token, refreshToken };
  }

  static async login(
    input: LoginInput
  ): Promise<
    | { user: { id: string; email: string; name: string | null; createdAt: Date }; token: string; refreshToken: string; requiresTwoFactor?: false }
    | { requiresTwoFactor: true; tempToken: string }
  > {
    const user = await UserRepository.findByEmail(input.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    // ----------------------------------------------------------------
    // Admin accounts require 2FA — return a temp token challenge instead
    // of a full JWT. The full session is only issued after code verification.
    // ----------------------------------------------------------------
    if (user.role === "ADMIN") {
      const { plainCode, codeHash } = await TwoFactorService.generateCode();
      await TwoFactorService.createRecord(user.id, codeHash);

      const tempToken = TempTokenService.issue(user.id, user.email);

      // Log code to backend console ONLY — never sent to client
      console.log(
        `[2FA] Admin verification code for ${user.email}: ${plainCode}  (expires in 5 minutes)`
      );

      return { requiresTwoFactor: true, tempToken };
    }

    // ----------------------------------------------------------------
    // Regular users — normal JWT flow (unchanged)
    // ----------------------------------------------------------------
    const token = this.generateToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    try {
      await db.user.update({
        where: { id: user.id },
        data: { refreshToken, lastLoginAt: new Date() },
      });
    } catch {
      // No DB – skip
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Finalises an admin login after a successful 2FA code verification.
   * Issues the full JWT + refreshToken and persists lastLoginAt.
   */
  static async finalizeAdminLogin(
    userId: string
  ): Promise<{ user: { id: string; email: string; name: string | null; role: string; createdAt: Date }; token: string; refreshToken: string }> {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const token = this.generateToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    try {
      await db.user.update({
        where: { id: userId },
        data: { refreshToken, lastLoginAt: new Date() },
      });
    } catch {
      // No DB – skip
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role ?? "ADMIN",
        createdAt: typeof user.createdAt === "string" ? new Date(user.createdAt) : user.createdAt,
      },
      token,
      refreshToken,
    };
  }

  static async refresh(refreshToken: string) {
    let payload: { userId: string };
    try {
      payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as { userId: string };
    } catch {
      throw new Error("Invalid or expired refresh token");
    }

    // Verify token is still stored in DB
    try {
      const user = await db.user.findUnique({ where: { id: payload.userId } });
      if (!user || user.refreshToken !== refreshToken) {
        throw new Error("Refresh token revoked");
      }
    } catch (err: any) {
      if (err.message === "Refresh token revoked") throw err;
      // DB unavailable – trust the JWT signature
    }

    const newToken = this.generateToken(payload.userId);
    const newRefreshToken = this.generateRefreshToken(payload.userId);

    try {
      await db.user.update({
        where: { id: payload.userId },
        data: { refreshToken: newRefreshToken },
      });
    } catch {
      // No DB
    }

    return { token: newToken, refreshToken: newRefreshToken };
  }

  static async logout(userId: string) {
    try {
      await db.user.update({ where: { id: userId }, data: { refreshToken: null } });
    } catch {
      // No DB – nothing to clear
    }
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, env.REFRESH_TOKEN_SECRET, {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any,
    });
  }

  static verifyToken(token: string) {
    return jwt.verify(token, env.JWT_SECRET) as { userId: string };
  }
}
