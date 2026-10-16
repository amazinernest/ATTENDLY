import { sessionStorage } from "@/lib/session.server";

export async function action({ request }: { request: Request }) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return Response.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    }
  );
}

export async function loader({ request }: { request: Request }) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return Response.json(
    { success: true },
    {
      status: 200,
      headers: {
        "Set-Cookie": await sessionStorage.destroySession(session),
      },
    }
  );
}
