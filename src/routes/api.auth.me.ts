import { getUser } from "@/lib/session.server";

export async function loader({ request }: { request: Request }) {
  try {
    const user = await getUser(request);
    if (!user) {
      return Response.json({ authenticated: false, user: null }, { status: 401 });
    }
    return Response.json({ authenticated: true, user });
  } catch {
    return Response.json({ authenticated: false, user: null }, { status: 401 });
  }
}
