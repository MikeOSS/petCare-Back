import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

import { CONFIG } from "@/core/config";
import database from "@/core/database";
import { AuthenticationError } from "@/core/server/errors/authenticationError";

import { getBearerOrCookieToken } from "./getToken";

type JwtPayload = {
  role: string;
  sessionId: string;
};

/** Hook que corre antes das rotas “privadas”: valida JWT + sessão e preenche req.user. */
export async function requireAuth(
  req: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  if (!CONFIG.SECURITY.JWT_SECRET) {
    throw new Error("JWT secret not defined");
  }

  const raw = getBearerOrCookieToken(req);
  if (!raw) {
    throw new AuthenticationError("Precisas de iniciar sessão primeiro.");
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(raw, CONFIG.SECURITY.JWT_SECRET) as JwtPayload;
  } catch {
    throw new AuthenticationError("Sessão inválida ou expirada.");
  }

  const session = await database.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  });

  if (!session || session.expires_at.getTime() < Date.now()) {
    throw new AuthenticationError("Sessão expirada. Volta a fazer login.");
  }

  if (session.user.status !== "ACTIVE") {
    throw new AuthenticationError("Esta conta não está ativa.");
  }

  req.user = session.user;
}
