import type { FastifyRequest } from "fastify";

/** Cookie (browser) ou Bearer (app mobile) — os dois são válidos. */
export function getBearerOrCookieToken(req: FastifyRequest): string | undefined {
  const fromCookie = req.cookies.token;
  if (fromCookie) return fromCookie;

  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }

  return undefined;
}
