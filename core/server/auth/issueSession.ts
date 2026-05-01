import type { User } from "@/.generated/client";
import type { FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import moment from "moment";

import { CONFIG } from "@/core/config";
import database from "@/core/database";

import { sanitizeUser } from "./sanitizeUser";

type JwtPayload = {
  role: string;
  sessionId: string;
};

/** Cria sessão na BD, assina JWT, envia cookie httpOnly e devolve o mesmo token no JSON (útil no Expo/React Native, onde cookie nem sempre funciona). */
export async function issueSessionResponse(
  res: FastifyReply,
  user: User,
): Promise<void> {
  if (!CONFIG.SECURITY.JWT_SECRET) {
    throw new Error("JWT secret not defined");
  }

  const expireTime = moment().add(7, "days").toDate();

  const session = await database.session.create({
    data: {
      user_id: user.id,
      expires_at: expireTime,
    },
  });

  const payload: JwtPayload = {
    role: user.role,
    sessionId: session.id,
  };

  const token = jwt.sign(payload, CONFIG.SECURITY.JWT_SECRET, {
    expiresIn: "7d",
  });

  await res
    .setCookie("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: CONFIG.IS_DEV ? "strict" : "none",
      secure: CONFIG.IS_DEV ? false : true,
      domain: process.env.COOKIE_DOMAIN || undefined,
      expires: expireTime,
    })
    .send({
      user: sanitizeUser(user),
      token,
    });
}
