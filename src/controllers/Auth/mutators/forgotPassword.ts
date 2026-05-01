import { Endpoint } from "@/core/server/endpoints/types";

// Ainda não ligamos a envio de email — isto evita dar erro no botão “esqueci a senha” na app.
// A mensagem é genérica de propósito (não diz se o email existe).
const forgotPassword: Endpoint = async () => {
  return {
    message:
      "Se existir uma conta com este email, enviaremos instruções em breve.",
  };
};

forgotPassword.httpMethod = "POST";
forgotPassword.path = "/forgot-password";
forgotPassword.isPublic = true;

export default forgotPassword;
