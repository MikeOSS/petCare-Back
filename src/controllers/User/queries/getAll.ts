import database from "@/core/database";
import { Endpoint } from "@/core/server/endpoints/types";

const getAll: Endpoint = async () => {
  return await database.user.findMany();
};

// Endpoint settings
getAll.httpMethod = "GET";
getAll.path = "/";

export default getAll;
