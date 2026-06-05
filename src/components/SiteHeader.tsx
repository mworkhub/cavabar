import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-sm border-b border-[#2C1E16]/5">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">

        <Link
          href="/"
          aria-label="Cava Bar — на головну"
          className="hover:opacity-80 transition-opacity duration-300 flex-shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.svg"
            alt="Cava Bar"
            className="h-14 sm:h-20 w-auto"
          />
        </Link>

        <nav className="flex flex-row flex-nowrap items-center gap-1 sm:gap-3 md:gap-5">
          <Link
            href="/menu"
            className="whitespace-nowrap text-[10px] sm:text-[11px] md:text-[13px]
                       font-medium uppercase tracking-[0.1em] md:tracking-[0.15em]
                       bg-[#2C1E16] text-white px-2.5 py-1.5 sm:px-4 sm:py-2 md:px-5 rounded-full
                       hover:bg-[#C68E58] transition-colors duration-200"
          >
            Меню
          </Link>
          <Link
            href="/reviews"
            className="whitespace-nowrap text-[10px] sm:text-[11px] md:text-[13px]
                       font-medium uppercase tracking-[0.1em] md:tracking-[0.15em]
                       text-[#2C1E16] hover:text-[#C68E58] transition-colors duration-200"
          >
            Відгуки
          </Link>
          <Link
            href="/contacts"
            className="whitespace-nowrap text-[10px] sm:text-[11px] md:text-[13px]
                       font-medium uppercase tracking-[0.1em] md:tracking-[0.15em]
                       text-[#2C1E16] hover:text-[#C68E58] transition-colors duration-200"
          >
            Контакти
          </Link>
          <Link
            href="/vacancies"
            className="whitespace-nowrap text-[10px] sm:text-[11px] md:text-[13px]
                       font-medium uppercase tracking-[0.1em] md:tracking-[0.15em]
                       text-[#2C1E16] hover:text-[#C68E58] transition-colors duration-200"
          >
            Вакансії
          </Link>
        </nav>

      </div>
    </header>
  );
}
