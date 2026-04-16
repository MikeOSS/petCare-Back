import Fastify from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { User } from "@/.generated/client";

import errorHandler from "./errors";
import { createRouters, registerRouters } from "./router/register";
import mapEndpoints from "./endpoints";

import "@/core/config";
import "@/core/logging";
import { reportTelemetryError } from "./telemetry";

declare module "fastify" {
  interface FastifyRequest {
    user?: User;
    allowedProjects: string[];
  }
}

export default async function startServer() {
  const fastify = Fastify();

  fastify.register(cors, {
    origin: process.env.FRONT_END_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  });

  fastify.register(multipart, {
    limits: { fileSize: 10_485_760, fieldNameSize: 300 },
  });

  fastify.decorateRequest("user");
  fastify.register(cookie);

  fastify.setErrorHandler(errorHandler);

  // Setup routes on fastify instance using autoload
  const controllerMap = await mapEndpoints();
  const routers = await createRouters(controllerMap);
  await registerRouters(routers, fastify);

  // Log route access if in development mode
  if (process.env.NODE_ENV === "development") {
    fastify.addHook("onRequest", (req, res, next) => {
      console.log(req.method, req.url);
      next();
    });
  }

  const port = Number(process.env.SERVER_PORT) || 3001;

  // Early return in test environments. Return the fastify instance so we can
  //  inject HTTP calls. See https://fastify.dev/docs/v1.14.x/Documentation/Testing/
  if (process.env.NODE_ENV == "test") {
    return fastify;
  }

  // Start server listener
  fastify.listen({ port, host: "0.0.0.0" }, function (err) {
    if (err) {
      reportTelemetryError(err);
      throw err.message;
    }

    console.info(`Server is running at http://0.0.0.0:${port}`);
  });
}
