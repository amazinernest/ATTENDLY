import { type LoaderFunctionArgs } from "react-router";
import prisma from "@/lib/db";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      {
        status: "ok",
        database: "connected",
        service: "ClassMark Attendance API",
        emailService: process.env.RESEND_API_KEY ? "Resend API" : (process.env.SMTP_HOST ? "SMTP" : "Simulated/None"),
        emailSender: process.env.EMAIL_FROM || "ClassMark <noreply@classmarker.online>",
        appVersion: "1.0.2",
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return Response.json(
      {
        status: "error",
        message: err?.message || "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
