import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Build output folder. Defaults to .next; set NEXT_BUILD_DIR (e.g. .next-build)
   * to run a production build while `next dev` owns .next.
   */
  distDir: process.env.NEXT_BUILD_DIR || ".next",

  /**
   * Keep old WordPress URLs working: they're in ads, WhatsApp messages and
   * search results. WordPress used trailing slashes; Next strips them first.
   */
  async redirects() {
    return [
      { source: "/manisha-masterclass", destination: "/masterclass", permanent: true },
      { source: "/manishalp", destination: "/leadership-workshop", permanent: true },
      { source: "/manishalp-1", destination: "/leadership-workshop", permanent: true },
      { source: "/thankyou", destination: "/thank-you", permanent: true },
      { source: "/thankyou-diamond", destination: "/thank-you", permanent: true },
      { source: "/home", destination: "/", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://api.razorpay.com\")" },
        ],
      },
    ];
  },
};

export default nextConfig;
