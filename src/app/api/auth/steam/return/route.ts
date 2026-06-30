/**
 * Steam OpenID 2.0 — step 2.
 *
 * Steam redirects the browser here with a bag of openid.* query params.
 * We forward them to NextAuth's `signIn("steam", ...)` server action,
 * which calls the Steam Credentials provider's `authorize()`. That
 * method re-verifies the params with Steam (check_authentication) and
 * either creates a session or rejects.
 */
import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";

export async function GET(req: NextRequest) {
  const params: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "callbackUrl") params[key] = value;
  });
  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") ?? "/";

  if (!params["openid.mode"]) {
    return NextResponse.redirect(new URL("/login?error=steam_missing_params", req.nextUrl.origin));
  }

  try {
    // `signIn` throws a NEXT_REDIRECT on success — let Next.js handle it.
    await signIn("steam", { ...params, redirectTo: callbackUrl });
    // Unreachable on success.
    return NextResponse.redirect(new URL(callbackUrl, req.nextUrl.origin));
  } catch (err) {
    // NextAuth throws control-flow errors; re-throw so Next can process them.
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[auth] Steam sign-in failed:", err);
    return NextResponse.redirect(new URL("/login?error=steam_failed", req.nextUrl.origin));
  }
}
