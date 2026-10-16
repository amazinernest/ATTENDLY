import React from "react";
import { useLoaderData } from "react-router";
import { requireUser } from "@/lib/session.server";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NewCourseForm } from "@/components/courses/NewCourseForm";

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  return { user };
}

export default function NewCoursePage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout user={user}>
      <NewCourseForm user={user} />
    </DashboardLayout>
  );
}
