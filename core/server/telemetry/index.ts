import { CONFIG } from "@/core/config";
import { captureException } from "@sentry/node";
import { FastifyRequest } from "fastify";

export function reportTelemetryError(error: unknown, req?: FastifyRequest) {
  // Guard clause, do not report to Sentry in development
  if (CONFIG.IS_DEV) return console.error(error);

  let data: Record<string, unknown> = { env: CONFIG.NODE_ENV };

  if (req && req.headers) {
    data = {
      ...data,
      user_id: req?.user?.id,
      user_agent: req?.headers?.["user-agent"],
      referer: req?.headers?.referer,
      url: req?.url,
    };
  }

  captureException(error, { data });
}
