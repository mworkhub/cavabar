"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Copy, Download, ExternalLink, Check } from "lucide-react";

const MENU_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cava-bar.vercel.app") + "/menu";

export function QRCodeBlock() {
  const canvasRef   = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(MENU_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    /* render at 4× for print quality */
    const size = 1024;
    const out  = document.createElement("canvas");
    out.width  = size;
    out.height = size;
    const ctx  = out.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, size, size);

    const a  = document.createElement("a");
    a.href   = out.toDataURL("image/png");
    a.download = "cava-bar-menu-qr.png";
    a.click();
  }

  const btnBase =
    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.97]";

  return (
    <div className="bg-white rounded-2xl shadow-sm shadow-[#2C1E16]/6 overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#2C1E16]/6 bg-[#FDFBF7]">
        <div className="w-7 h-7 rounded-lg bg-[#C68E58]/12 flex items-center justify-center text-base">
          📷
        </div>
        <div>
          <h2 className="font-heading text-[15px] font-bold text-[#2C1E16] leading-none">QR-код меню</h2>
          <p className="text-[10px] text-[#2C1E16]/40 mt-0.5">Роздрукуйте і поставте на столики</p>
        </div>
      </div>

      {/* body */}
      <div className="px-6 py-5 flex flex-col sm:flex-row gap-6 items-start">

        {/* QR canvas */}
        <div
          ref={canvasRef}
          className="flex-shrink-0 p-3 rounded-2xl border border-[#2C1E16]/8 bg-white"
        >
          <QRCodeCanvas
            value={MENU_URL}
            size={140}
            bgColor="#FFFFFF"
            fgColor="#2C1E16"
            level="H"
            marginSize={1}
          />
        </div>

        {/* controls */}
        <div className="flex flex-col gap-3 flex-1 min-w-0">

          {/* URL field */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2C1E16]/40">
              Посилання на меню
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-xl bg-[#F2EAE0] text-xs text-[#2C1E16] font-mono truncate">
                {MENU_URL}
              </code>
              <button
                onClick={handleCopy}
                title="Копіювати"
                className={`${btnBase} flex-shrink-0 px-3 border
                  ${copied
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "border-[#2C1E16]/12 text-[#2C1E16]/60 hover:border-[#C68E58]/50 hover:text-[#C68E58]"
                  }`}
              >
                {copied
                  ? <><Check size={14} strokeWidth={2.5} /> Скопійовано</>
                  : <><Copy size={14} strokeWidth={2} /> Копіювати</>
                }
              </button>
            </div>
          </div>

          {/* action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleDownload}
              className={`${btnBase} bg-[#2C1E16] text-white hover:opacity-85`}
            >
              <Download size={15} strokeWidth={2} />
              Завантажити PNG
            </button>
            <a
              href={MENU_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btnBase} border border-[#2C1E16]/15 text-[#2C1E16]/70 hover:border-[#C68E58]/50 hover:text-[#C68E58]`}
            >
              <ExternalLink size={15} strokeWidth={2} />
              Переглянути меню
            </a>
          </div>

          <p className="text-[10px] text-[#2C1E16]/30 leading-relaxed">
            PNG завантажується у розмірі 1024×1024 px — достатньо для якісного друку.
          </p>
        </div>
      </div>
    </div>
  );
}
