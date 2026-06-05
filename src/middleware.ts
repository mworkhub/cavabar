import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/* ── In-memory rate limiter ──────────────────────────────────
   Resets on cold start (acceptable for single-admin MVP).
   For multi-instance production, replace with Upstash Redis.    */
type RateEntry = { count: number; resetAt: number };
const loginAttempts = new Map<string, RateEntry>();

const LOGIN_MAX     = 10;   // max POST-like navigations per window
const LOGIN_WINDOW  = 60_000; // 1 minute in ms

function isLoginRateLimited(ip: string): boolean {
  const now  = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW });
    return false;
  }
  if (entry.count >= LOGIN_MAX) return true;
  entry.count++;
  return false;
}

/* Prune stale entries to avoid unbounded memory growth */
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of loginAttempts) {
    if (now > entry.resetAt) loginAttempts.delete(ip);
  }
}, 5 * 60_000);

export async function middleware(request: NextRequest) {
  /* Rate-limit login page to block automated brute-force page loads */
  if (request.nextUrl.pathname === "/admin/login") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isLoginRateLimited(ip)) {
      return new NextResponse("Too many requests. Try again in a minute.", {
        status: 429,
        headers: { "Retry-After": "60", "Content-Type": "text/plain" },
      });
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  /* Refresh the session — this extends the access token if it's still valid.
     IMPORTANT: must use getUser(), not getSession(), to validate with the server. */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminPath =
    request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/admin/login");

  if (isAdminPath && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
