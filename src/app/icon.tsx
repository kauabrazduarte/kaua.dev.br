import { ImageResponse } from "next/og";

export const runtime = "edge";
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
          background:
            "linear-gradient(135deg, #a78bfa 0%, #7c3aed 60%, #fbbf24 100%)",
          color: "#0e0a1f",
          fontWeight: 800,
          fontSize: 32,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
          borderRadius: 14,
        }}
      >
        KB
      </div>
    ),
    size,
  );
}
