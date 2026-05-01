import type { FastifyRequest } from "fastify";

// Helpers para quando no futuro existir permissão por “projeto” na base de dados.
// Por agora só ADMIN passa; o resto fica fechado até o modelo existir no Prisma.

export function isProjectActionAllowed(
  user: FastifyRequest["user"],
  _projectId: string,
  _action: "READ" | "WRITE",
) {
  if (user?.role === "ADMIN") return true;
  return false;
}

export function getAllowedProjects(
  user: FastifyRequest["user"],
  _action: "READ" | "WRITE" = "READ",
) {
  if (user?.role === "ADMIN") return true;
  return [] as string[];
}
