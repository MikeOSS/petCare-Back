import { PrismaClientKnownRequestError } from "@/.generated/runtime/library";
import { FastifyReply, FastifyRequest } from "fastify";

export default function handlePrismaError(
  error: PrismaClientKnownRequestError,
  req: FastifyRequest,
  res: FastifyReply,
) {
  switch (error.code) {
    // Unique Constraint Error
    case "P2002": {
      return res.status(409).send({ message: error.message });
    }
  }
}
