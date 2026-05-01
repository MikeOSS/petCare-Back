import { sanitizeUser } from "@/core/server/auth/sanitizeUser";
import { Endpoint } from "@/core/server/endpoints/types";

// Quem sou eu? Devolve o utilizador ligado ao token (sem senha).
const me: Endpoint = async (req) => {
  if (!req.user) {
    throw new Error("requireAuth devia ter preenchido req.user");
  }
  return sanitizeUser(req.user);
};

me.httpMethod = "GET";
me.path = "/me";

export default me;
