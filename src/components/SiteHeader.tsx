import Link from "next/link";

/* ── Minimal cup icon ────────────────────────────────────── */

function CupIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* steam — single wisp */}
      <path d="M14 6.5C11.5 5 11.5 3 14 2.5" />

      {/* cup body */}
      <path d="M6 10L22 10L20.5 22Q20.5 23.5 19 23.5H9Q7.5 23.5 7.5 22Z" />

      {/* handle */}
      <path d="M20.5 14C25 14 25 21 20.5 21" />

      {/* saucer */}
      <path d="M3.5 26Q14 27.5 24.5 26" />
    </svg>
  );
}

/* ── Component ───────────────────────────────────────────── */

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm border-b border-[#2C1E16]/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link
          href="/"
          aria-label="Cava Bar — на головну"
          className="flex items-center gap-3 text-[#2C1E16]
                     hover:opacity-80 transition-opacity duration-300"
        >
          {/* swap with <img src="/logo.png" alt="Cava Bar" className="h-8 w-auto" /> when ready */}
          <CupIcon />
          <span className="font-heading text-lg font-medium uppercase tracking-[0.2em] leading-none">
            Cava Bar
          </span>
        </Link>

        {/* ── Navigation ── */}
        <nav className="flex items-center gap-5 sm:gap-7">
          <Link
            href="/menu"
            className="text-[13px] font-medium uppercase tracking-[0.15em] text-[#2C1E16]/55
                       hover:text-[#C68E58] transition-colors duration-200"
          >
            Меню
          </Link>
          <Link
            href="/reviews"
            className="text-[13px] font-medium uppercase tracking-[0.15em] text-[#2C1E16]/55
                       hover:text-[#C68E58] transition-colors duration-200"
          >
            Відгуки
          </Link>
          <Link
            href="/contacts"
            className="text-[13px] font-medium uppercase tracking-[0.15em] text-[#2C1E16]/55
                       hover:text-[#C68E58] transition-colors duration-200"
          >
            Контакти
          </Link>
        </nav>

      </div>
    </header>
  );
}
