import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NewCourseForm } from "./NewCourseForm";

export default async function NewCoursePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?from=/courses/new");
  }

  return (
    <DashboardLayout user={user}>
      <NewCourseForm user={user} />
    </DashboardLayout>
  );
}
