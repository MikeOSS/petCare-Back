import database from "@/core/database";
import { sanitizeUser } from "@/core/server/auth/sanitizeUser";
import { PermissionError } from "@/core/server/errors/permissionError";
import { Endpoint } from "@/core/server/endpoints/types";

// Lista completa só para ADMIN — utilizadores normais usam GET /auth/me ou GET /users/:id do próprio perfil.
const getAll: Endpoint = async (req) => {
  if (req.user?.role !== "ADMIN") {
    throw new PermissionError(
      "Só administradores podem ver a lista completa de utilizadores.",
    );
  }

  const users = await database.user.findMany();
  return users.map(sanitizeUser);
};

getAll.httpMethod = "GET";
getAll.path = "/";

export default getAll;
