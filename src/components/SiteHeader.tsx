import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm border-b border-[#2C1E16]/5">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* ── Logo ── */}
        <Link
          href="/"
          aria-label="Cava Bar — на головну"
          className="hover:opacity-80 transition-opacity duration-300"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.svg"
            alt="Cava Bar"
            className="h-16 w-auto"
          />
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
