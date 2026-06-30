/**
 * Steam OpenID 2.0 — step 1.
 *
 * Builds the Steam OpenID URL and redirects the browser. The `return_to`
 * points at /api/auth/steam/return, which validates the response and
 * hands off to NextAuth's `signIn("steam", ...)`.
 */
import { NextRequest, NextResponse } from "next/server";
import { buildSteamSignInUrl } from "@/auth-providers";

export async function GET(req: NextRequest) {
  const origin = process.env.NEXTAUTH_URL ?? req.nextUrl.origin;
  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") ?? "/";

  const returnTo = new URL("/api/auth/steam/return", origin);
  returnTo.searchParams.set("callbackUrl", callbackUrl);

  const steamUrl = buildSteamSignInUrl(returnTo.toString());
  return NextResponse.redirect(steamUrl);
}
