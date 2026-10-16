import { z } from "zod";
import prisma from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { sessionStorage } from "@/lib/session.server";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: "Please provide a valid email and password" },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Auto-verify email in development or if SMTP is not configured
    if (!user.isEmailVerified) {
      const isSmtpConfigured = !!(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASSWORD
      );
      if (!isSmtpConfigured || process.env.NODE_ENV !== "production") {
        await prisma.user.update({
          where: { id: user.id },
          data: { isEmailVerified: true },
        });
      } else {
        return Response.json(
          {
            error: "Your email address is not yet verified. Please check your inbox or verification link.",
            unverified: true,
            email: user.email,
          },
          { status: 403 }
        );
      }
    }

    // Set standard session cookie
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", user.id);

    return Response.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          institution: user.institution,
        },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(session),
        },
      }
    );
  } catch (error) {
    console.error("[Login Action Error]:", error);
    return Response.json(
      { error: "An authentication error occurred. Please try again." },
      { status: 500 }
    );
  }
}
