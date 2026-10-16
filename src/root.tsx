import React from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { getUser } from "@/lib/session.server";
import { AuthProvider } from "@/lib/auth-context";
import "./index.css";

export async function loader({ request }: { request: Request }) {
  const user = await getUser(request);
  return { user };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ClassMark | University Attendance Platform</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: { loaderData?: { user: any } }) {
  return (
    <AuthProvider initialUser={loaderData?.user}>
      <Outlet />
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 - Not Found" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{message}</h1>
        <p className="text-slate-600 mb-6">{details}</p>
        {stack && (
          <pre className="text-left text-xs bg-slate-100 p-4 rounded overflow-x-auto mb-6 text-red-600">
            {stack}
          </pre>
        )}
        <a
          href="/"
          className="inline-block px-4 py-2 bg-sky-700 text-white rounded-lg font-medium hover:bg-sky-800 transition"
        >
          Return Home
        </a>
      </div>
    </main>
  );
}
