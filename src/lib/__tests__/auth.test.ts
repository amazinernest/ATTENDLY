import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "../auth";

describe("Authentication Utilities", () => {
  it("hashes password and verifies correctly", async () => {
    const password = "Secur3P@ssw0rd!2026";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("WrongPassword123", hash)).toBe(false);
  });

  it("creates and verifies a valid JWT session token", async () => {
    const payload = {
      userId: "user_test_123",
      email: "lecturer@university.edu.ng",
      fullName: "Dr. Adaeze Okafor",
    };

    const token = await createSessionToken(payload);
    expect(typeof token).toBe("string");

    const verified = await verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.fullName).toBe(payload.fullName);
  });

  it("returns null for malformed or tampered token", async () => {
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.malformed.payload";
    const result = await verifySessionToken(invalidToken);
    expect(result).toBeNull();
  });
});
