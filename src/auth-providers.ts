/**
 * Provider registry — each provider is opt-in via env flags.
 *
 *   AUTH_DISCORD=true + DISCORD_CLIENT_ID + DISCORD_CLIENT_SECRET
 *   AUTH_GITHUB=true  + GITHUB_CLIENT_ID  + GITHUB_CLIENT_SECRET
 *   AUTH_GOOGLE=true  + GOOGLE_CLIENT_ID  + GOOGLE_CLIENT_SECRET
 *   AUTH_STEAM=true   + STEAM_API_KEY
 *   AUTH_LOCAL=true   (no extra creds — uses bcrypt on Account.access_token)
 *
 * If a provider is enabled but its credentials are missing we log a
 * warning and skip it, so a typo in `.env` can't take the auth flow
 * down — the page just shows the providers that are correctly wired.
 */
import type { Provider } from "next-auth/providers";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function envBool(name: string): boolean {
  const raw = process.env[name];
  if (!raw) return false;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

function hasEnvs(...names: string[]): boolean {
  return names.every((n) => Boolean(process.env[n]));
}

// ────────────────────────────────────────────────────────────────────────
// Steam OpenID 2.0 (custom)
// ────────────────────────────────────────────────────────────────────────
// NextAuth v5 doesn't ship a built-in Steam provider. Steam uses OpenID
// 2.0 (not OAuth2), so we model it as a Credentials provider whose
// "credentials" are the OpenID query params Steam returns to the
// callback. Flow:
//   1. /api/auth/signin/steam → we redirect the browser to Steam's
//      OpenID endpoint (handled by the /login page calling our helper
//      that builds the OpenID URL).
//   2. Steam redirects back to /api/auth/callback/steam with a bag of
//      openid.* query params.
//   3. We POST those back to Steam with mode=check_authentication; if
//      Steam answers `is_valid:true`, we extract the 17-digit SteamID64
//      from openid.claimed_id.
//   4. Optionally hit the Steam Web API to fetch the player's display
//      name + avatar.
// ────────────────────────────────────────────────────────────────────────

const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";
const STEAM_ID_REGEX = /^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

interface SteamProfile {
  steamid: string;
  personaname: string;
  avatarfull?: string;
}

async function verifySteamOpenId(params: Record<string, string>): Promise<string | null> {
  const body = new URLSearchParams({ ...params, "openid.mode": "check_authentication" });
  const res = await fetch(STEAM_OPENID_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) return null;
  const text = await res.text();
  if (!text.includes("is_valid:true")) return null;
  const claimed = params["openid.claimed_id"];
  if (!claimed) return null;
  const m = STEAM_ID_REGEX.exec(claimed);
  return m ? m[1] : null;
}

async function fetchSteamProfile(steamId: string): Promise<SteamProfile | null> {
  const key = process.env.STEAM_API_KEY;
  if (!key) return { steamid: steamId, personaname: `Player ${steamId.slice(-6)}` };
  try {
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${key}&steamids=${steamId}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { response?: { players?: SteamProfile[] } };
    return data.response?.players?.[0] ?? null;
  } catch {
    return null;
  }
}

function steamProvider(): Provider {
  return Credentials({
    id: "steam",
    name: "Steam",
    // The /login page redirects to Steam's OpenID endpoint and Steam
    // calls back with these query params; the callback handler forwards
    // them as the "credentials" object to authorize().
    credentials: {
      "openid.ns": { type: "text" },
      "openid.mode": { type: "text" },
      "openid.op_endpoint": { type: "text" },
      "openid.claimed_id": { type: "text" },
      "openid.identity": { type: "text" },
      "openid.return_to": { type: "text" },
      "openid.response_nonce": { type: "text" },
      "openid.assoc_handle": { type: "text" },
      "openid.signed": { type: "text" },
      "openid.sig": { type: "text" },
    },
    async authorize(credentials) {
      if (!credentials) return null;
      const params: Record<string, string> = {};
      for (const [k, v] of Object.entries(credentials)) {
        if (typeof v === "string") params[k] = v;
      }
      const steamId = await verifySteamOpenId(params);
      if (!steamId) return null;

      const profile = await fetchSteamProfile(steamId);
      const displayName = profile?.personaname ?? `Player ${steamId.slice(-6)}`;
      const image = profile?.avatarfull ?? null;

      // Link to an existing User if we've seen this steamId before;
      // otherwise create a fresh one (role=PLAYER by default).
      const existing = await prisma.user.findUnique({ where: { steamId } });
      if (existing) {
        return {
          id: existing.id,
          name: existing.name ?? displayName,
          email: existing.email,
          image: existing.image ?? image,
        };
      }
      const created = await prisma.user.create({
        data: { steamId, name: displayName, image },
      });
      return { id: created.id, name: displayName, email: null, image };
    },
  });
}

// ────────────────────────────────────────────────────────────────────────
// Local credentials (email + bcrypt password)
// ────────────────────────────────────────────────────────────────────────
// Stored shape: User row with email + an Account row with
// provider="local" and access_token = bcrypt hash. Registration is
// handled by a separate /api/auth/register route (A2 continues).
// ────────────────────────────────────────────────────────────────────────

function localProvider(): Provider {
  return Credentials({
    id: "local",
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) return null;
      const email = String(credentials.email).toLowerCase();
      const password = String(credentials.password);

      const user = await prisma.user.findUnique({
        where: { email },
        include: { accounts: { where: { provider: "local" } } },
      });
      if (!user || user.banned) return null;
      const account = user.accounts[0];
      if (!account?.access_token) return null;

      const ok = await bcrypt.compare(password, account.access_token);
      if (!ok) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  });
}

// ────────────────────────────────────────────────────────────────────────
// Registry
// ────────────────────────────────────────────────────────────────────────

interface ProviderRegistration {
  id: string;
  displayName: string;
  envFlag: string;
  envCredentials?: string[];
  build: () => Provider;
}

const REGISTRATIONS: ProviderRegistration[] = [
  {
    id: "discord",
    displayName: "Discord",
    envFlag: "AUTH_DISCORD",
    envCredentials: ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET"],
    build: () =>
      Discord({
        clientId: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      }),
  },
  {
    id: "github",
    displayName: "GitHub",
    envFlag: "AUTH_GITHUB",
    envCredentials: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
    build: () =>
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      }),
  },
  {
    id: "google",
    displayName: "Google",
    envFlag: "AUTH_GOOGLE",
    envCredentials: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    build: () =>
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
  },
  {
    id: "steam",
    displayName: "Steam",
    envFlag: "AUTH_STEAM",
    // STEAM_API_KEY is optional (only used to fetch persona/avatar).
    envCredentials: [],
    build: steamProvider,
  },
  {
    id: "local",
    displayName: "Email",
    envFlag: "AUTH_LOCAL",
    envCredentials: [],
    build: localProvider,
  },
];

export function resolveProviders(): Provider[] {
  const enabled: Provider[] = [];
  for (const reg of REGISTRATIONS) {
    if (!envBool(reg.envFlag)) continue;
    if (reg.envCredentials && reg.envCredentials.length > 0 && !hasEnvs(...reg.envCredentials)) {
      console.warn(
        `[auth] ${reg.displayName} enabled (${reg.envFlag}=true) but ${reg.envCredentials.join(
          " / ",
        )} is missing — skipping.`,
      );
      continue;
    }
    try {
      enabled.push(reg.build());
    } catch (err) {
      console.error(`[auth] Failed to build ${reg.displayName} provider:`, err);
    }
  }
  return enabled;
}

export interface EnabledProvider {
  id: string;
  name: string;
}

export function listEnabledProviderNames(): EnabledProvider[] {
  const out: EnabledProvider[] = [];
  for (const reg of REGISTRATIONS) {
    if (!envBool(reg.envFlag)) continue;
    if (reg.envCredentials && reg.envCredentials.length > 0 && !hasEnvs(...reg.envCredentials)) continue;
    out.push({ id: reg.id, name: reg.displayName });
  }
  return out;
}

// Helper for the /login page: builds the URL the browser should be
// redirected to to start Steam OpenID 2.0.
export function buildSteamSignInUrl(returnTo: string): string {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": new URL(returnTo).origin,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `${STEAM_OPENID_URL}?${params.toString()}`;
}
