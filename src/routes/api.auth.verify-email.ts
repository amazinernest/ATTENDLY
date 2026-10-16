import prisma from "@/lib/db";
import { sessionStorage } from "@/lib/session.server";

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return Response.json({ error: "Invalid or missing token" }, { status: 400 });
    }

    const verificationRecord = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationRecord) {
      return Response.json(
        { error: "Invalid or expired verification token." },
        { status: 400 }
      );
    }

    if (verificationRecord.expiresAt < new Date()) {
      await prisma.emailVerificationToken.delete({ where: { id: verificationRecord.id } });
      return Response.json(
        { error: "Verification token has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: verificationRecord.userId },
      data: { isEmailVerified: true },
    });

    // Delete used token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationRecord.id },
    });

    // Commit session directly
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.set("userId", verificationRecord.user.id);

    return Response.json(
      {
        success: true,
        message: "Email verified successfully! Redirecting to your dashboard...",
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": await sessionStorage.commitSession(session),
        },
      }
    );
  } catch (error) {
    console.error("[Verify Email Error]:", error);
    return Response.json(
      { error: "Failed to verify email. Please try again." },
      { status: 500 }
    );
  }
}
