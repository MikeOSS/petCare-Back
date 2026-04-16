import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import GenericError from "./generic";
import { PermissionError } from "./permissionError";
import { UserNotFoundError } from "./userNotFound";
import { AuthenticationError } from "./authenticationError";
import { reportTelemetryError } from "../telemetry";

export default function errorHandler(
  error: FastifyError,
  req: FastifyRequest,
  res: FastifyReply,
) {
  // Do not log autehntication errors
  if (error instanceof AuthenticationError) {
    return null;
  }

  // Log errors in development, send errors to telemetry everywhere else
  reportTelemetryError(error, req);

  if (error instanceof GenericError) {
    return res.status(error.status).send({ message: error.message });
  }

  if (error instanceof PermissionError) {
    return res.status(error.status).send({ message: error.message });
  }

  if (error instanceof AuthenticationError) {
    res.clearCookie("token"); // Clear token cookie if still valid
    return res.status(error.status).send({ message: error.message });
  }

  if (error instanceof UserNotFoundError) {
    return res.status(error.status).send({ message: error.message });
  }

  res.status(500).send({ message: error.message });
}
