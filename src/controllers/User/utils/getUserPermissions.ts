import { PermissionLevel } from "@/.generated/client";
import { FastifyRequest } from "fastify";

export function isProjectActionAllowed(
  user: FastifyRequest["user"],
  projectId: string,
  action: PermissionLevel,
) {
  if (user?.role === "ADMIN") return true;

  const permittedIds =
    user?.permissions
      .filter((entry) =>
        action === "WRITE" ? entry.permission === "WRITE" : true,
      )
      .map((permission) => permission.project_id) || [];

  return permittedIds.includes(projectId);
}

export function getAllowedProjects(
  user: FastifyRequest["user"],
  action: PermissionLevel = "READ",
) {
  if (user?.role === "ADMIN") return true;

  const permittedIds =
    user?.permissions
      .filter((entry) =>
        action === "WRITE" ? entry.permission === "WRITE" : true,
      )
      .map((permission) => permission.project_id) || [];

  return permittedIds;
}
