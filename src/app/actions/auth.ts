"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import prisma from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return { error: "Please enter a valid institutional email and password." };
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return { error: "Invalid email or password." };
  }

  const isMatch = await verifyPassword(password, user.passwordHash);
  if (!isMatch) {
    return { error: "Invalid email or password." };
  }

  // Auto-verify in development if unverified
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
      return {
        error: "Your email address is not yet verified. Please check your inbox or verification link.",
      };
    }
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
  });

  await setSessionCookie(token);

  return { success: true };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
