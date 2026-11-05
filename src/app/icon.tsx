import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// nodejs runtime so we can read the bundled avatar from /public.
export const runtime = "nodejs";
// 256² is big enough to look crisp when browsers downscale to 16/32/48
// (favicon) and large enough for PWA / OS contexts.
export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default async function Icon() {
  const buf = await readFile(
    path.join(process.cwd(), "public", "avatar-ink.png"),
  );
  const dataUri = `data:image/png;base64,${buf.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          // Fully circular crop. The outer container is the only painted
          // area; the corners outside the circle stay transparent in the
          // resulting PNG.
          borderRadius: 9999,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <img
          src={dataUri}
          width={size.width}
          height={size.height}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    ),
    size,
  );
}
