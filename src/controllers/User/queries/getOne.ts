import database from "@/core/database";
import { Endpoint } from "@/core/server/endpoints/types";

type Params = {
  id: string;
};

const getOne: Endpoint = async (request) => {
  const params = request.params as Params;

  return await database.user.findUnique({
    where: { id: params.id },
  });
};

// Endpoint settings
getOne.httpMethod = "GET";
getOne.path = "/:id";

export default getOne;
