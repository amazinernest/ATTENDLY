import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimit } from "../rate-limit";
import { DEFAULT_SECURITY_HEADERS, applySecurityHeaders } from "../security-headers";
import { z } from "zod";

describe("Production Hardening & Reliability Checklist Suite", () => {
  beforeEach(() => {
    resetRateLimit("test:key:1");
    resetRateLimit("test:plus:user+test@domain.com");
  });

  describe("Email Resilience with Plus-signs and UTF-8 Names", () => {
    const emailSchema = z.string().email();

    it("accepts and standardizes emails with plus-addressing (tags)", () => {
      const emailWithPlus = "Lecturer+Fall2026@University.edu.ng";
      const parsed = emailSchema.safeParse(emailWithPlus);
      expect(parsed.success).toBe(true);

      const normalized = emailWithPlus.toLowerCase().trim();
      expect(normalized).toBe("lecturer+fall2026@university.edu.ng");
      expect(normalized).toContain("+fall2026");
    });

    it("safely handles names with apostrophes, accents, and international characters", () => {
      const complexNames = [
        "Dr. Patrick O'Connor",
        "Prof. N'Djamena Keita",
        "Dr. René François Müller",
        "Dr. فاطمة الزهراء",
        "Chioma Okafor 🎓",
      ];

      const nameSchema = z.string().min(2).max(100);
      for (const name of complexNames) {
        const result = nameSchema.safeParse(name);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("Rate Limiting (Brute-Force & Credential Stuffing Prevention)", () => {
    it("allows requests within threshold and blocks excess requests with retry duration", () => {
      const config = { maxRequests: 3, windowMs: 10000 };

      // Request 1: allowed
      const r1 = checkRateLimit("test:key:1", config);
      expect(r1.success).toBe(true);
      expect(r1.remaining).toBe(2);

      // Request 2: allowed
      const r2 = checkRateLimit("test:key:1", config);
      expect(r2.success).toBe(true);
      expect(r2.remaining).toBe(1);

      // Request 3: allowed
      const r3 = checkRateLimit("test:key:1", config);
      expect(r3.success).toBe(true);
      expect(r3.remaining).toBe(0);

      // Request 4: blocked
      const r4 = checkRateLimit("test:key:1", config);
      expect(r4.success).toBe(false);
      expect(r4.remaining).toBe(0);
      expect(r4.retryAfterSeconds).toBeGreaterThan(0);
    });

    it("resets rate limit window on demand", () => {
      const config = { maxRequests: 2, windowMs: 10000 };
      checkRateLimit("test:key:1", config);
      checkRateLimit("test:key:1", config);
      const blocked = checkRateLimit("test:key:1", config);
      expect(blocked.success).toBe(false);

      resetRateLimit("test:key:1");
      const afterReset = checkRateLimit("test:key:1", config);
      expect(afterReset.success).toBe(true);
    });
  });

  describe("OWASP Production Security Headers", () => {
    it("injects defense-in-depth headers on responses", () => {
      const initialResponse = new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });

      const securedResponse = applySecurityHeaders(initialResponse);

      expect(securedResponse.headers.get("X-Frame-Options")).toBe("DENY");
      expect(securedResponse.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(securedResponse.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
      expect(securedResponse.headers.get("Permissions-Policy")).toBeDefined();
    });
  });
});
