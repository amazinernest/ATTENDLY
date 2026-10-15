import crypto from "crypto";
import QRCode from "qrcode";
import prisma from "@/lib/db";
import { VerificationMethod } from "@/generated/prisma/enums";

export interface CreateSessionParams {
  courseId: string;
  topic?: string;
  durationMinutes: number;
  sessionPin?: string;
  verificationMethod: VerificationMethod;
  allowLateCheckin?: boolean;
}

/**
 * Generates high-resolution data URL for QR code
 */
export async function generateQrCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 480,
    margin: 2,
    color: {
      dark: "#0F172A", // Deep charcoal/navy
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });
}

/**
 * Creates a new attendance session with cryptographically secure token
 */
export async function createAttendanceSession(params: CreateSessionParams) {
  const token = crypto.randomBytes(24).toString("base64url");
  const startTime = new Date();
  const expiresAt = new Date(startTime.getTime() + params.durationMinutes * 60 * 1000);

  // Generate 4-digit numeric in-class display PIN if none provided
  const sessionPin = params.sessionPin?.trim() || Math.floor(1000 + Math.random() * 9000).toString();

  const session = await prisma.attendanceSession.create({
    data: {
      courseId: params.courseId,
      topic: params.topic?.trim() || null,
      token,
      sessionPin,
      status: "OPEN",
      startTime,
      expiresAt,
      verificationMethod: params.verificationMethod,
      allowLateCheckin: params.allowLateCheckin ?? false,
    },
    include: {
      course: {
        select: {
          id: true,
          code: true,
          title: true,
          lecturerId: true,
        },
      },
    },
  });

  return session;
}

/**
 * Closes an active attendance session
 */
export async function closeAttendanceSession(sessionId: string, lecturerId: string) {
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: { course: true },
  });

  if (!session || session.course.lecturerId !== lecturerId) {
    throw new Error("Session not found or unauthorized");
  }

  const updated = await prisma.attendanceSession.update({
    where: { id: sessionId },
    data: {
      status: "CLOSED",
      endTime: new Date(),
    },
  });

  // Log audit event
  await prisma.auditLog.create({
    data: {
      userId: lecturerId,
      courseId: session.courseId,
      sessionId: session.id,
      action: "SESSION_CLOSED",
      details: JSON.stringify({ closedAt: new Date().toISOString() }),
    },
  });

  return updated;
}
