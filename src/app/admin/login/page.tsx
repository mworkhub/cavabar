"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { loginAction } from "./actions";

const STORAGE_KEY   = "cava-login-lockout";
const LOCKOUT_AFTER = 5;
const LOCKOUT_MS    = 60_000;

function readLockout(): { attempts: number; lockedUntil: number | null } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { attempts: 0, lockedUntil: null };
    const parsed = JSON.parse(raw);
    if (parsed.lockedUntil && Date.now() >= parsed.lockedUntil) {
      sessionStorage.removeItem(STORAGE_KEY);
      return { attempts: 0, lockedUntil: null };
    }
    return parsed;
  } catch { return { attempts: 0, lockedUntil: null }; }
}

function writeLockout(attempts: number, lockedUntil: number | null) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ attempts, lockedUntil })); } catch {}
}

export default function AdminLoginPage() {
  const router = useRouter();
  const captchaRef = useRef<HCaptcha>(null);

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPwd,      setShowPwd]      = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [attempts,     setAttempts]     = useState(0);
  const [lockedUntil,  setLockedUntil]  = useState<number | null>(null);

  /* Restore rate-limit state from sessionStorage on mount */
  useEffect(() => {
    const saved = readLockout();
    setAttempts(saved.attempts);
    setLockedUntil(saved.lockedUntil);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    /* ── Client-side lockout check (persisted in sessionStorage) ── */
    const { attempts: cur, lockedUntil: lock } = readLockout();

    if (lock && Date.now() < lock) {
      const secs = Math.ceil((lock - Date.now()) / 1000);
      setError(`Забагато спроб. Спробуйте через ${secs} сек.`);
      return;
    }

    if (!captchaToken) {
      setError("Будь ласка, пройдіть перевірку на робота.");
      return;
    }

    setLoading(true);

    /* ── Server Action: captcha verify → Supabase auth ── */
    const result = await loginAction(email, password, captchaToken);

    /* Always reset captcha after attempt — tokens are single-use */
    captchaRef.current?.resetCaptcha();
    setCaptchaToken(null);

    if (!result.success) {
      if (result.error === "captcha_failed") {
        setError("Перевірка на робота не пройдена. Спробуйте ще раз.");
        setLoading(false);
        return;
      }

      if (result.error === "server_error") {
        setError("Помилка сервера. Спробуйте через хвилину.");
        setLoading(false);
        return;
      }

      /* auth_failed — increment rate limit counter */
      const next    = cur + 1;
      const newLock = next >= LOCKOUT_AFTER ? Date.now() + LOCKOUT_MS : null;
      setAttempts(next);
      setLockedUntil(newLock);
      writeLockout(next, newLock);

      setError(
        newLock
          ? "5 невдалих спроб. Вхід заблоковано на 1 хвилину."
          : `Невірний email або пароль. Спроба ${next}/${LOCKOUT_AFTER}.`
      );
      setLoading(false);
      return;
    }

    sessionStorage.removeItem(STORAGE_KEY);
    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-[#F2EAE0] flex items-center justify-center px-4">

      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-2xl bg-[#F9F8F6] flex items-center justify-center mb-4 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.svg" alt="Cava Bar" className="w-[80%] h-auto" />
          </div>
          <p className="text-[#2C1E16]/45 text-sm">Адміністративна панель</p>
        </div>

        {/* card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-[#2C1E16]/8 px-8 py-8">

          <h2 className="font-heading text-lg font-bold text-[#2C1E16] mb-6">Вхід</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#2C1E16]/55 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cava-bar.com"
                className="w-full px-4 py-3 rounded-xl border border-[#2C1E16]/15 bg-[#FDFBF7]
                           text-sm text-[#2C1E16] placeholder:text-[#2C1E16]/30
                           focus:outline-none focus:ring-2 focus:ring-[#C68E58]/40 focus:border-[#C68E58]
                           transition-colors"
              />
            </div>

            {/* password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#2C1E16]/55 uppercase tracking-wide">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-[#2C1E16]/15 bg-[#FDFBF7]
                             text-sm text-[#2C1E16] placeholder:text-[#2C1E16]/30
                             focus:outline-none focus:ring-2 focus:ring-[#C68E58]/40 focus:border-[#C68E58]
                             transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2C1E16]/35 hover:text-[#2C1E16]/60 transition-colors"
                  aria-label={showPwd ? "Сховати пароль" : "Показати пароль"}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* hCaptcha widget */}
            <div className="flex justify-center">
              <HCaptcha
                ref={captchaRef}
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY!}
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
                onError={() => setCaptchaToken(null)}
                theme="light"
                size="normal"
              />
            </div>

            {/* error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* submit — disabled until captcha is solved */}
            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="mt-1 w-full py-3 rounded-xl bg-[#C68E58] text-white text-sm font-semibold
                         hover:opacity-90 active:scale-[0.98] transition-all duration-100
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Вхід…" : "Увійти"}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
