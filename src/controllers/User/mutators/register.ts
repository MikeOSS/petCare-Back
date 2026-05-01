import database from "@/core/database";
import { issueSessionResponse } from "@/core/server/auth/issueSession";
import { Endpoint } from "@/core/server/endpoints/types";
import bcrypt from "bcryptjs";

type Body = {
  first_name: string;
  last_name: string;
  password: string;
};

type Params = {
  token: string;
};

// Fluxo por convite: o admin já criou o user com email + token no link; aqui o utilizador escolhe nome e senha.
const register: Endpoint = async (req, res) => {
  const body = req.body as Body;
  const params = req.params as Params;

  let user = await database.user.findFirstOrThrow({
    where: { invite_token: params.token },
  });

  const password = await bcrypt.hash(body.password, 12);
  const email = user.email;

  user = await database.user.update({
    where: {
      id: user.id,
    },
    data: {
      first_name: body.first_name,
      last_name: body.last_name,
      invite_expire_date: null,
      invite_token: null,
      status: "ACTIVE",
      password,
      email,
    },
  });

  await issueSessionResponse(res, user);
};

register.httpMethod = "PUT";
register.path = "/register/:token";
register.isPublic = true;

export default register;
