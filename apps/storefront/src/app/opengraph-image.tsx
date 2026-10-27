import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

// Default share card for any page without its own image.
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
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
          justifyContent: "center",
          padding: 80,
          background: "#fff1e8",
          border: "24px solid #000",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 200,
            fontWeight: 900,
            color: "#000",
            lineHeight: 1,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            alignSelf: "flex-start",
            padding: "16px 28px",
            background: "#51D6FF",
            border: "8px solid #000",
            fontSize: 48,
            fontWeight: 900,
            textTransform: "uppercase",
          }}
        >
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    size
  );
}
