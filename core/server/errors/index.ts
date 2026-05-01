import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

import { reportTelemetryError } from "../telemetry";
import { AuthenticationError } from "./authenticationError";
import GenericError from "./generic";
import { PermissionError } from "./permissionError";
import { UserNotFoundError } from "./userNotFound";

export default function errorHandler(
  error: FastifyError,
  req: FastifyRequest,
  res: FastifyReply,
) {
  // Erros de login não vão para telemetria (acontecem muito e não são “bugs”).
  if (!(error instanceof AuthenticationError)) {
    reportTelemetryError(error, req);
  }

  // Subclasses de GenericError primeiro — cada uma pode precisar de tratamento extra.
  if (error instanceof AuthenticationError) {
    res.clearCookie("token", {
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined,
    });
    return res.status(error.status).send({ message: error.message });
  }

  if (error instanceof PermissionError) {
    return res.status(error.status).send({ message: error.message });
  }

  if (error instanceof UserNotFoundError) {
    return res.status(error.status).send({ message: error.message });
  }

  if (error instanceof GenericError) {
    return res.status(error.status).send({ message: error.message });
  }

  res.status(500).send({ message: error.message });
}
