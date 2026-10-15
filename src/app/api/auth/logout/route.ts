import { NextResponse } from "next/server";
import { clearSessionCookie, removeSessionCookie } from "@/lib/auth";

export async function POST() {
  await clearSessionCookie();
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  removeSessionCookie(response);
  return response;
}
