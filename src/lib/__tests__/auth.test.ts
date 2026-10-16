import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../auth";
import { sessionStorage } from "../session.server";

describe("Authentication Utilities", () => {
  it("hashes password and verifies correctly", async () => {
    const password = "Secur3P@ssw0rd!2026";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("WrongPassword123", hash)).toBe(false);
  });

  it("creates and verifies a valid cookie session", async () => {
    const session = await sessionStorage.getSession();
    session.set("userId", "user_test_123");
    const cookieHeader = await sessionStorage.commitSession(session);

    expect(typeof cookieHeader).toBe("string");
    expect(cookieHeader).toContain("classmark_session=");

    const readSession = await sessionStorage.getSession(cookieHeader);
    expect(readSession.get("userId")).toBe("user_test_123");
  });

  it("handles empty or tampered cookie session gracefully", async () => {
    const readSession = await sessionStorage.getSession("classmark_session=tampered.fake.cookie");
    expect(readSession.get("userId")).toBeUndefined();
  });
});
