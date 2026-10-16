import { createCookieSessionStorage, redirect } from "react-router";
import prisma from "@/lib/db";

const sessionSecret =
  process.env.SESSION_SECRET || "classmark-super-secure-jwt-session-secret-key-32chars-minimum";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "classmark_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
  },
});

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(request: Request): Promise<string | undefined> {
  const session = await getSession(request);
  const userId = session.get("userId");
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        institution: true,
        department: true,
        isEmailVerified: true,
        timeZone: true,
        defaultThreshold: true,
        defaultSessionDuration: true,
        defaultVerificationMethod: true,
      },
    });

    if (user) return user;
  } catch (error) {
    console.error("Failed to fetch user from session:", error);
    return null;
  }

  // Session exists but user not found in DB (e.g. deleted user)
  throw await logout(request);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["from", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      institution: true,
      department: true,
      isEmailVerified: true,
      timeZone: true,
      defaultThreshold: true,
      defaultSessionDuration: true,
      defaultVerificationMethod: true,
    },
  });

  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({
  request,
  userId,
  remember = true,
  redirectTo = "/dashboard",
}: {
  request: Request;
  userId: string;
  remember?: boolean;
  redirectTo?: string;
}) {
  const session = await getSession(request);
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
