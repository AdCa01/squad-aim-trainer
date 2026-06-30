/**
 * NextAuth.js v5 configuration.
 *
 * The Auth module is opt-in via the `auth` Compose profile. The Stats and
 * Core modules don't require this file — pages reference it conditionally
 * via `process.env.MODULE_AUTH === "true"` checks.
 *
 * Providers are listed in `./auth-providers.ts` and added conditionally
 * based on env (AUTH_DISCORD=true enables Discord, etc.). The first
 * sign-in via OAuth creates the User row (role = PLAYER by default); the
 * email matching `ADMIN_BOOTSTRAP_EMAIL` is promoted to SUPER_ADMIN at
 * first sign-in so an empty deployment isn't admin-less.
 *
 * Session strategy is JWT — Credentials providers (Steam + local) don't
 * support the database strategy in NextAuth v5. The Prisma adapter still
 * owns User/Account/VerificationToken rows; the Session table is unused.
 */
import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";
import { resolveProviders } from "@/auth-providers";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "PLAYER" | "ADMIN" | "SUPER_ADMIN";
      banned: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "PLAYER" | "ADMIN" | "SUPER_ADMIN";
    banned?: boolean;
  }
}

const ADMIN_BOOTSTRAP_EMAIL = (process.env.ADMIN_BOOTSTRAP_EMAIL ?? "").toLowerCase();

export const { auth, signIn, signOut, handlers } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: resolveProviders(),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /**
     * Block banned users from signing in. Also bootstrap the first
     * SUPER_ADMIN by email so an empty deployment isn't admin-less.
     */
    async signIn({ user }) {
      if (!user.email) return true;
      const email = user.email.toLowerCase();

      if (ADMIN_BOOTSTRAP_EMAIL && email === ADMIN_BOOTSTRAP_EMAIL) {
        try {
          await prisma.user.update({
            where: { email },
            data: { role: "SUPER_ADMIN" },
          });
        } catch {
          // User row doesn't exist yet — next sign-in will promote.
        }
      }

      const dbUser = await prisma.user.findUnique({
        where: { email },
        select: { banned: true },
      });
      if (dbUser?.banned) return false;
      return true;
    },

    /**
     * Persist user id + role + banned flag in the JWT so RBAC checks
     * don't hit the database on every request. Refreshed from the DB on
     * sign-in and whenever NextAuth calls `update()`.
     */
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.userId = user.id;
      }
      const needsRefresh = trigger === "signIn" || trigger === "update" || token.role === undefined;
      if (needsRefresh && token.userId) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.userId },
          select: { role: true, banned: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.banned = fresh.banned;
        }
      }
      return token;
    },

    /**
     * Surface user id + role + banned on `session.user` so RSCs and
     * middleware can read them without a DB round-trip.
     */
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId;
      }
      session.user.role = token.role ?? "PLAYER";
      session.user.banned = token.banned ?? false;
      return session;
    },
  },
});
