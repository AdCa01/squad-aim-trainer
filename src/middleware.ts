/**
 * Edge middleware — minimal. We don't gate any page by login (anyone can
 * play / view the leaderboard); the POST /api/leaderboard endpoint enforces
 * its own auth via `auth()` and returns 401 when there's no session.
 * Banned users are blocked at sign-in (see auth.ts callbacks.signIn).
 *
 * This file is kept on purpose so adding a gate later is one-liner-easy.
 */
export const config = { matcher: [] };
