import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/*
 * Default social preview (1200×630) for every page that doesn't define its own.
 * Satori can't read CSS variables, so the palette tokens from globals.css are
 * repeated here as their hex values. It needs woff/ttf fonts (not woff2).
 */

export const alt = `${site.brand} with ${site.coach}, ${site.role}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const color = {
  jamun900: "#2a1636",
  jamun200: "#d9cde3",
  jamun100: "#ebe3f1",
  marigold400: "#f2a93b",
  marigold300: "#f7c87a",
};

const fontDir = join(process.cwd(), "node_modules/@fontsource");
const [rozha, mukta400, mukta600] = await Promise.all([
  readFile(join(fontDir, "rozha-one/files/rozha-one-latin-400-normal.woff")),
  readFile(join(fontDir, "mukta/files/mukta-latin-400-normal.woff")),
  readFile(join(fontDir, "mukta/files/mukta-latin-600-normal.woff")),
]);

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px 64px",
          backgroundColor: color.jamun900,
          fontFamily: "Mukta",
          color: color.jamun100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* The site mark: a rising stroke, the "shift". */}
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect x="1" y="1" width="30" height="30" rx="8" fill="none" stroke={color.marigold400} strokeOpacity="0.45" strokeWidth="1.5" />
            <path
              d="M7.5 22.5h7l9-11.5"
              fill="none"
              stroke={color.marigold400}
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18.5 10.5h5.5v5.5"
              fill="none"
              stroke={color.marigold400}
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: color.marigold300,
            }}
          >
            {site.role}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontFamily: "Rozha One",
              fontSize: 136,
              lineHeight: 1,
              color: "#fff",
              letterSpacing: "-0.01em",
            }}
          >
            <span>The Power</span>
            <span style={{ marginLeft: 34, color: color.marigold400, position: "relative", top: -24 }}>Shift</span>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 46, color: color.jamun100 }}>{site.tagline}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 28,
            borderTop: "1.5px solid rgba(255,255,255,0.16)",
            fontSize: 28,
            color: color.jamun200,
          }}
        >
          <div style={{ display: "flex", fontWeight: 600, color: "#fff" }}>with {site.coach}</div>
          <div style={{ display: "flex" }}>{site.domain}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Rozha One", data: rozha, weight: 400, style: "normal" },
        { name: "Mukta", data: mukta400, weight: 400, style: "normal" },
        { name: "Mukta", data: mukta600, weight: 600, style: "normal" },
      ],
    },
  );
}
