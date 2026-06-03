import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cava Bar — Кав'ярня в Бродах",
    short_name: "Cava Bar",
    description: "Меню, відгуки та контакти кав'ярні Cava Bar у Бродах",
    start_url: "/menu",
    display: "standalone",
    background_color: "#FDFBF7",
    theme_color: "#C68E58",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
