/**
 * NextAuth.js v5 catch-all route handler.
 *
 * Exposes /api/auth/* endpoints (sign-in, callback, session, etc.) by
 * re-exporting the `handlers` produced in `src/auth.ts`. NextAuth v5
 * returns `{ handlers: { GET, POST } }` from the factory; we unwrap
 * them here so Next.js sees route exports at the expected names.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
