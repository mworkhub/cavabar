"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Невірний email або пароль.");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="min-h-screen bg-[#F2EAE0] flex items-center justify-center px-4">

      <div className="w-full max-w-sm">

        {/* logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#2C1E16] flex items-center justify-center mb-4 shadow-lg">
            <Coffee size={26} strokeWidth={2} className="text-[#C68E58]" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#2C1E16]">Cava Bar</h1>
          <p className="text-[#2C1E16]/45 text-sm mt-1">Адміністративна панель</p>
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

            {/* error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
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
