import database from "@/core/database";
import { sanitizeUser } from "@/core/server/auth/sanitizeUser";
import { PermissionError } from "@/core/server/errors/permissionError";
import { UserNotFoundError } from "@/core/server/errors/userNotFound";
import { Endpoint } from "@/core/server/endpoints/types";

type Params = {
  id: string;
};

const getOne: Endpoint = async (request) => {
  const params = request.params as Params;
  const current = request.user;

  if (current?.role !== "ADMIN" && current?.id !== params.id) {
    throw new PermissionError("Só podes ver o teu próprio perfil.");
  }

  const user = await database.user.findUnique({
    where: { id: params.id },
  });

  if (!user) {
    throw new UserNotFoundError("Utilizador não encontrado.");
  }

  return sanitizeUser(user);
};

getOne.httpMethod = "GET";
getOne.path = "/:id";

export default getOne;
