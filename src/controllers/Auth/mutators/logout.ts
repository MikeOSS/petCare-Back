import { CONFIG } from "@/core/config";
import database from "@/core/database";
import { getBearerOrCookieToken } from "@/core/server/auth/getToken";
import { Endpoint } from "@/core/server/endpoints/types";
import jwt from "jsonwebtoken";

type Payload = { sessionId: string };

// Apaga a sessão na base de dados e limpa o cookie — útil para “sair” de forma limpinha.
const logout: Endpoint = async (req, res) => {
  const raw = getBearerOrCookieToken(req);
  if (raw && CONFIG.SECURITY.JWT_SECRET) {
    try {
      const { sessionId } = jwt.verify(raw, CONFIG.SECURITY.JWT_SECRET) as Payload;
      await database.session.deleteMany({ where: { id: sessionId } });
    } catch {
      // Token já inválido — seguimos só para limpar o cookie no browser.
    }
  }

  res.clearCookie("token", {
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
  });

  return res.status(204).send();
};

logout.httpMethod = "POST";
logout.path = "/logout";

export default logout;
