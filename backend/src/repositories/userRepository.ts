import { db } from "../config/db";
import { RegisterInput } from "../validators/authValidator";

const IS_PROD = process.env.NODE_ENV === "production";
const HAS_DB = !!(
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("USER:PASSWORD")
);

function isDbConnectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const anyErr = err as { name?: string; message?: string };
  return (
    anyErr.name === "PrismaClientInitializationError" ||
    (typeof anyErr.message === "string" &&
      /can't reach database server|can't connect|connection refused|ECONNREFUSED|ENOTFOUND/i.test(anyErr.message))
  );
}

// In-memory fallback — ONLY used in non-production environments when DATABASE_URL is unconfigured.
// In production, all DB errors are thrown to callers; no silent fallback.
const devUsersByEmail = new Map<string, any>();
const devUsersById = new Map<string, any>();

function devFallbackRequired(): boolean {
  return !IS_PROD && !HAS_DB;
}

export class UserRepository {
  static async findByEmail(email: string) {
    if (devFallbackRequired()) {
      return devUsersByEmail.get(email) || null;
    }
    try {
      return await db.user.findUnique({
        where: { email },
      });
    } catch (err) {
      const fallback = devFallbackRequired() || (!IS_PROD && isDbConnectionError(err));
      if (!fallback) {
        console.error("[UserRepository] Database error in findByEmail:", err);
        throw err;
      }
      console.warn("[UserRepository] Prisma connection failed in development, using in-memory store.", err);
      return devUsersByEmail.get(email) || null;
    }
  }

  static async findById(id: string) {
    if (devFallbackRequired()) {
      const user = devUsersById.get(id);
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      };
    }
    try {
      return await db.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (err) {
      const fallback = devFallbackRequired() || (!IS_PROD && isDbConnectionError(err));
      if (!fallback) {
        console.error("[UserRepository] Database error in findById:", err);
        throw err;
      }
      console.warn("[UserRepository] Prisma connection failed in development, using in-memory store.", err);
      const user = devUsersById.get(id);
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      };
    }
  }

  static async create(data: RegisterInput & { role?: string }) {
    if (devFallbackRequired()) {
      const devId = "dev-user-" + Math.random().toString(36).substring(2, 11);
      const devUser = {
        id: devId,
        email: data.email,
        password: data.password,
        name: data.name ?? null,
        role: data.role ?? "USER",
        createdAt: new Date(),
      };
      devUsersByEmail.set(data.email, devUser);
      devUsersById.set(devId, devUser);
      return {
        id: devUser.id,
        email: devUser.email,
        name: devUser.name,
        role: devUser.role,
        createdAt: devUser.createdAt,
      };
    }
    try {
      return await db.user.create({
        data: {
          email: data.email,
          password: data.password,
          name: data.name ?? null,
          role: data.role ?? "USER",
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (err) {
      const fallback = devFallbackRequired() || (!IS_PROD && isDbConnectionError(err));
      if (!fallback) {
        console.error("[UserRepository] Database error in create:", err);
        throw err;
      }
      console.warn("[UserRepository] Prisma creation failed in development, using in-memory store.", err);
      const devId = "dev-user-" + Math.random().toString(36).substring(2, 11);
      const devUser = {
        id: devId,
        email: data.email,
        password: data.password,
        name: data.name ?? null,
        role: data.role ?? "USER",
        createdAt: new Date(),
      };
      devUsersByEmail.set(data.email, devUser);
      devUsersById.set(devId, devUser);
      return {
        id: devUser.id,
        email: devUser.email,
        name: devUser.name,
        role: devUser.role,
        createdAt: devUser.createdAt,
      };
    }
  }
}
