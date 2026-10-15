import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

const settingsSchema = z.object({
  fullName: z.string().min(2).max(100),
  institution: z.string().max(150).optional(),
  department: z.string().max(100).optional(),
  timeZone: z.string().default("Africa/Lagos"),
  defaultThreshold: z.number().min(1).max(100).default(75.0),
  defaultSessionDuration: z.number().int().min(5).max(300).default(30),
  defaultVerificationMethod: z.enum(["STUDENT_PIN", "EMAIL_OTP", "OPEN_CHECKIN"]).default("STUDENT_PIN"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = settingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;
    const updatePayload: any = {
      fullName: data.fullName.trim(),
      institution: data.institution?.trim() || null,
      department: data.department?.trim() || null,
      timeZone: data.timeZone,
      defaultThreshold: data.defaultThreshold,
      defaultSessionDuration: data.defaultSessionDuration,
      defaultVerificationMethod: data.defaultVerificationMethod,
    };

    // If changing password, verify current password
    if (data.newPassword && data.newPassword.trim().length > 0) {
      if (!data.currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password." },
          { status: 400 }
        );
      }

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isCurrentMatch = await verifyPassword(data.currentPassword, dbUser.passwordHash);
      if (!isCurrentMatch) {
        return NextResponse.json(
          { error: "Incorrect current password." },
          { status: 400 }
        );
      }

      updatePayload.passwordHash = await hashPassword(data.newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updatePayload,
      select: {
        id: true,
        fullName: true,
        email: true,
        institution: true,
        department: true,
        timeZone: true,
        defaultThreshold: true,
        defaultSessionDuration: true,
        defaultVerificationMethod: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("[Settings Update Error]:", error);
    return NextResponse.json(
      { error: "Failed to update profile settings." },
      { status: 500 }
    );
  }
}
