/**
 * OWASP & Enterprise Production Security Headers
 * Provides defense-in-depth against XSS, Clickjacking, MIME-sniffing, and data exfiltration.
 */

export const DEFAULT_SECURITY_HEADERS: Record<string, string> = {
  // Prevent clickjacking by forbidding embedding in iframes
  "X-Frame-Options": "DENY",

  // Prevent browsers from MIME-sniffing away from declared Content-Type
  "X-Content-Type-Options": "nosniff",

  // Referrer policy protecting sensitive route information while preserving origin for analytics
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Restrict access to sensitive browser features (camera, microphone, payment)
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=(self)",

  // Legacy XSS filter protection for older browsers
  "X-XSS-Protection": "1; mode=block",

  // Strict Transport Security (HSTS) - 1 year with subdomains in production
  ...(process.env.NODE_ENV === "production"
    ? { "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload" }
    : {}),
};

/**
 * Apply security headers to any outgoing Response
 */
export function applySecurityHeaders(response: Response): Response {
  for (const [header, value] of Object.entries(DEFAULT_SECURITY_HEADERS)) {
    if (!response.headers.has(header)) {
      response.headers.set(header, value);
    }
  }
  return response;
}
