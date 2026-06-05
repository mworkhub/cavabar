"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type LoginResult =
  | { success: true }
  | { success: false; error: "captcha_failed" | "auth_failed" | "server_error" };

export async function loginAction(
  email: string,
  password: string,
  captchaToken: string
): Promise<LoginResult> {
  /* ── 1. Verify hCaptcha token server-side ──────────────────
     The SECRET key never leaves the server — only NEXT_PUBLIC_HCAPTCHA_SITEKEY
     is in the browser bundle.                                  */
  try {
    const verifyRes = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret:   process.env.HCAPTCHA_SECRET ?? "",
        response: captchaToken,
      }),
    });

    if (!verifyRes.ok) return { success: false, error: "server_error" };

    const { success: captchaOk } = (await verifyRes.json()) as { success: boolean };
    if (!captchaOk) return { success: false, error: "captcha_failed" };
  } catch {
    return { success: false, error: "server_error" };
  }

  /* ── 2. Sign in with Supabase (server-side, sets auth cookies) ── */
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: "auth_failed" };

    return { success: true };
  } catch {
    return { success: false, error: "server_error" };
  }
}
