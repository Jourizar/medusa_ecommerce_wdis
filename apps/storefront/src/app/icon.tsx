import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#77269A",
          color: "#fff1e8",
          border: "6px solid #000",
          fontSize: 40,
          fontWeight: 900,
        }}
      >
        W
      </div>
    ),
    size
  );
}
