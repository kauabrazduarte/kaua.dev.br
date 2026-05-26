// OAuth callback: exchanges the ?code= for tokens and shows the refresh_token
// so you can copy it into SPOTIFY_REFRESH_TOKEN in .env.local. After pasting
// and restarting the dev server, you can delete this route if you want — it's
// only useful during setup.
import { NextResponse } from "next/server";
import { getRedirectUri } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 });
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET missing" },
      { status: 500 },
    );
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
    }),
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return new NextResponse(
      `<pre style="font:14px ui-monospace;padding:24px">Token exchange failed (${tokenRes.status}):\n\n${text}</pre>`,
      { status: tokenRes.status, headers: { "content-type": "text/html" } },
    );
  }

  const data = (await tokenRes.json()) as { refresh_token?: string };
  const refresh = data.refresh_token ?? "(no refresh_token returned)";

  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><title>Spotify refresh token</title>
<style>body{font:14px/1.5 ui-sans-serif,system-ui;max-width:680px;margin:48px auto;padding:0 24px;color:#222}code,pre{font-family:ui-monospace,monospace}pre{background:#f4f4f4;padding:16px;border-radius:8px;word-break:break-all;white-space:pre-wrap}strong{color:#b91c1c}</style>
<h1>✓ Refresh token obtido</h1>
<p>Cole o valor abaixo no <code>.env.local</code> em <code>SPOTIFY_REFRESH_TOKEN</code> e reinicie o dev server:</p>
<pre><strong>${refresh}</strong></pre>
<p>Depois disso, essa rota e a <code>/api/spotify/auth</code> podem ser apagadas (opcional — não pegam refresh por si).</p>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
