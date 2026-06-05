import type { NextConfig } from "next";

/* ── External hosts used by the app ─────────────────────────
   Keep in sync with remotePatterns below.                   */
const SUPABASE_HOST = "etccfzabuakzhpemqiyj.supabase.co";

/* ── Content-Security-Policy ────────────────────────────────
   Directives are tightly scoped to what the app actually uses:
   - next/font/google downloads fonts at build time → font-src 'self'
   - JSON-LD <script> via dangerouslySetInnerHTML → 'unsafe-inline'
   - Tailwind generates inline styles → style-src 'unsafe-inline'
   - Google Maps iframe → frame-src google.com
   - No external analytics scripts loaded yet (IDs stored in DB only)   */
function buildCSP(): string {
  const directives: Record<string, string[]> = {
    "default-src":  ["'self'"],
    "script-src":   ["'self'", "'unsafe-inline'", "https://hcaptcha.com", "https://*.hcaptcha.com"],
    "style-src":    ["'self'", "'unsafe-inline'", "https://hcaptcha.com", "https://*.hcaptcha.com"],
    "img-src":      [
      "'self'", "data:", "blob:",
      `https://${SUPABASE_HOST}`,
      "https://images.unsplash.com",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
      "https://www.cava-bar.com",
    ],
    "connect-src":  [
      "'self'",
      `https://${SUPABASE_HOST}`,
      `wss://${SUPABASE_HOST}`,
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://hcaptcha.com", "https://*.hcaptcha.com",
    ],
    "frame-src":    ["https://www.google.com", "https://hcaptcha.com", "https://*.hcaptcha.com"],
    "font-src":     ["'self'"],                      // next/font serves fonts locally
    "object-src":   ["'none'"],
    "base-uri":     ["'self'"],
    "form-action":  ["'self'"],
    "frame-ancestors": ["'none'"],                   // same as X-Frame-Options: DENY
  };

  return Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(" ")}`)
    .join("; ");
}

/* ── Security headers applied to every response ─────────── */
const securityHeaders = [
  /* HTTPS enforcement: tell browsers to always use HTTPS for 2 years.
     Vercel already redirects HTTP→HTTPS at the CDN layer; this adds
     the browser-level cache so even direct HTTP attempts never leave the device. */
  {
    key:   "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  /* Prevent this site from being embedded in iframes (clickjacking) */
  { key: "X-Frame-Options",           value: "DENY" },
  /* Disable MIME-type sniffing */
  { key: "X-Content-Type-Options",    value: "nosniff" },
  /* Don't send full referrer to third-party origins */
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  /* Restrict browser features not used by this app */
  {
    key:   "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  /* Granular script/resource policy */
  { key: "Content-Security-Policy",   value: buildCSP() },
  /* Defence in depth: disable XSS auditor (modern browsers ignore, legacy respect) */
  { key: "X-XSS-Protection",          value: "1; mode=block" },
];

/* ── CORS headers for /api/* routes (none exist yet, added preemptively) ── */
const corsHeaders = [
  { key: "Access-Control-Allow-Origin",  value: "https://www.cava-bar.com" },
  { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
  { key: "Access-Control-Max-Age",       value: "86400" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: SUPABASE_HOST,
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "www.cava-bar.com" },
      { protocol: "https", hostname: "cava-bar.com" },
    ],
  },

  async headers() {
    return [
      /* Security headers on all routes */
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      /* CORS only on API routes */
      {
        source: "/api/(.*)",
        headers: corsHeaders,
      },
    ];
  },
};

export default nextConfig;
