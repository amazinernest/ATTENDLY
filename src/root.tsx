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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
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
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#faf9f5]">
      <div className="max-w-md w-full bg-white rounded-[28px] shadow-sm border border-[#e7e5df] p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-[#111111] text-[#d7f837] flex items-center justify-center mx-auto mb-4 font-bold text-lg">
          !
        </div>
        <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight mb-2">{message}</h1>
        <p className="text-[#666660] text-sm mb-6 leading-relaxed">{details}</p>
        {stack && (
          <pre className="text-left text-xs bg-[#edebe4] p-4 rounded-xl overflow-x-auto mb-6 text-red-600 font-mono">
            {stack}
          </pre>
        )}
        <a
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-[#111111] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#d7f837] hover:text-black transition-all shadow-sm"
        >
          Return Home
        </a>
      </div>
    </main>
  );
}
