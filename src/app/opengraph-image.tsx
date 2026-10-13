import { ImageResponse } from "next/og";

// Default social share image for pages without their own (product pages use the product photo).
// Colours mirror the design tokens (ink, cream, primary); ImageResponse can't read CSS variables.
export const alt = "Angel Gallery: shoes, bags and clothing in Monrovia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          padding: 80,
          background: "#241c15",
          color: "#f3e9dc",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 999,
              border: "3px solid #f3e9dc",
              fontSize: 30,
            }}
          >
            AG
          </div>
          Angel Gallery
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, fontWeight: 700, maxWidth: 900 }}>
            Pieces Made For Everyday Living
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#d9c7b0" }}>
            Shoes · Bags · Clothing · Order on WhatsApp · Montserrado delivery
          </div>
        </div>
        <div style={{ display: "flex", height: 12, width: 160, background: "#7b5838", borderRadius: 999 }} />
      </div>
    ),
    size,
  );
}
