import database from "@/core/database";
import { issueSessionResponse } from "@/core/server/auth/issueSession";
import { AuthenticationError } from "@/core/server/errors/authenticationError";
import { Endpoint } from "@/core/server/endpoints/types";
import bcrypt from "bcryptjs";

type Body = { email: string; password: string };

// Entrada normal: verifica senha e abre uma sessão nova (igual ao fluxo do convite, mas sem token na URL).
const login: Endpoint = async (req, res) => {
  const body = req.body as Body;
  const email = body.email?.trim().toLowerCase();

  if (!email || !body.password) {
    throw new AuthenticationError("Email e senha são obrigatórios.");
  }

  const user = await database.user.findUnique({ where: { email } });
  if (!user?.password) {
    // Mesma mensagem nos dois casos — não revelamos se o email existe.
    throw new AuthenticationError("Email ou senha incorretos.");
  }

  const ok = await bcrypt.compare(body.password, user.password);
  if (!ok) {
    throw new AuthenticationError("Email ou senha incorretos.");
  }

  if (user.status !== "ACTIVE") {
    throw new AuthenticationError(
      "Esta conta ainda não está ativa. Completa o convite ou contacta o suporte.",
    );
  }

  await issueSessionResponse(res, user);
};

login.httpMethod = "POST";
login.path = "/login";
login.isPublic = true;

export default login;
