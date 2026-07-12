import jwt from "jsonwebtoken";

const TWO_FACTOR_SECRET =
  process.env.TWO_FACTOR_SECRET ?? "dev-2fa-secret-change-in-production-min-32-chars";
const TWO_FACTOR_EXPIRES_IN = process.env.TWO_FACTOR_EXPIRES_IN ?? "5m";

export interface TempTokenPayload {
  userId: string;
  email: string;
  purpose: "admin_2fa";
}

export class TempTokenService {
  /**
   * Issues a short-lived JWT (5 min) that identifies which admin is mid-2FA.
   * This token does NOT grant any access — it is only used to link the
   * verify-code call back to the correct user record.
   */
  static issue(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, purpose: "admin_2fa" } satisfies TempTokenPayload,
      TWO_FACTOR_SECRET,
      { expiresIn: TWO_FACTOR_EXPIRES_IN as any }
    );
  }

  /**
   * Verifies and decodes a temp token.
   * Throws if the token is invalid, expired, or not a 2FA purpose token.
   */
  static verify(token: string): TempTokenPayload {
    let payload: TempTokenPayload;
    try {
      payload = jwt.verify(token, TWO_FACTOR_SECRET) as TempTokenPayload;
    } catch {
      throw new Error("Invalid or expired session. Please log in again.");
    }

    if (payload.purpose !== "admin_2fa") {
      throw new Error("Invalid token purpose.");
    }

    return payload;
  }
}
