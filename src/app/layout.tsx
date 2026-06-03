import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { Preloader } from "@/components/Preloader";
import { SiteFooter } from "@/components/SiteFooter";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700", "900"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#C68E58",
};

export const metadata: Metadata = {
  title: "Cava Bar — кав'ярня у м. Броди",
  description:
    "Затишна кав'ярня у серці Бродів. Якісна кава, свіжа випічка, тепла атмосфера.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cava Bar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="uk"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FDFBF7] text-[#2C1E16]">
        <Preloader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
