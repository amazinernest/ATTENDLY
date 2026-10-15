import { describe, it, expect } from "vitest";
import prisma from "../db";

describe("Database Connection", () => {
  it("connects to PostgreSQL database and executes a query", async () => {
    const userCount = await prisma.user.count();
    expect(typeof userCount).toBe("number");
  });
});
