import { redirect } from "react-router";
import { requireUser } from "@/lib/session.server";

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { courseId?: string };
}) {
  await requireUser(request);
  const courseId = params.courseId;
  if (!courseId) {
    return redirect("/courses");
  }

  return redirect(`/courses/${courseId}?tab=settings`);
}

export default function CourseEditRedirect() {
  return null;
}
