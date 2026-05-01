import database from "@/core/database";
import { issueSessionResponse } from "@/core/server/auth/issueSession";
import GenericError from "@/core/server/errors/generic";
import { Endpoint } from "@/core/server/endpoints/types";
import bcrypt from "bcryptjs";

type Body = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

// Cadastro “aberto”: cria o utilizador já ativo com senha guardada (hash) na base de dados.
const signup: Endpoint = async (req, res) => {
  const body = req.body as Body;
  const email = body.email?.trim().toLowerCase();
  const first_name = body.first_name?.trim();
  const last_name = body.last_name?.trim() ?? "";

  if (!email || !body.password || !first_name) {
    throw new GenericError("Preenche nome, email e senha.", 400);
  }

  if (body.password.length < 6) {
    throw new GenericError("A senha deve ter pelo menos 6 caracteres.", 400);
  }

  const exists = await database.user.findUnique({ where: { email } });
  if (exists) {
    throw new GenericError("Já existe uma conta com este email.", 409);
  }

  const password = await bcrypt.hash(body.password, 12);

  const user = await database.user.create({
    data: {
      email,
      first_name,
      last_name,
      password,
      status: "ACTIVE",
      role: "BASIC",
    },
  });

  await issueSessionResponse(res, user);
};

signup.httpMethod = "POST";
signup.path = "/signup";
signup.isPublic = true;

export default signup;
