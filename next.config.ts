import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "etccfzabuakzhpemqiyj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "www.cava-bar.com",
      },
      {
        protocol: "https",
        hostname: "cava-bar.com",
      },
    ],
  },
};

export default nextConfig;
