import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// iOS pins this to the home screen at 180². iOS doesn't honour transparent
// corners (it renders the icon on a tile), so we keep the image fully
// circular — looks natural inside the iOS rounded-square frame.
export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const buf = await readFile(
    path.join(process.cwd(), "public", "avatar.png"),
  );
  const dataUri = `data:image/png;base64,${buf.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          borderRadius: 9999,
          overflow: "hidden",
          background: "transparent",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
