/**
 * Map all endpoints in the Controllers user directory to a single runtime
 * object. This is useful to avoid exporting/importing multiple endpoints
 * during runtime, mimicking Rails' autoload feature.
 */

import path from "node:path";

import { glob } from "glob";
import { ControllerMap, ControllerSettings } from "../endpoints/types";
import { existsSync } from "node:fs";
import { reportTelemetryError } from "../telemetry";

const IS_BUILT = __filename.endsWith(".mjs");
const EXT = IS_BUILT ? ".mjs" : "";

function checkControllerExists(controllerPath: string) {
  try {
    import(`${controllerPath}/index${EXT}`);
    return true;
  } catch {
    return false;
  }
}

// Controllers path may be in different locations depending on the environment
function findControllers() {
  const MAX_DEPTH = 5;
  let depth = 0;

  while (depth < MAX_DEPTH) {
    const rel = "../".repeat(depth) + "src/controllers";
    const controllersPath = path.join(__dirname, rel);
    if (existsSync(controllersPath)) return controllersPath;
    depth += 1;
  }

  throw new Error("No controllers path");
}

export default async function mapEndpoints() {
  // Find user directory
  const controllersPath = findControllers();
  const controllersPaths = await glob(path.join(controllersPath, "/*"));

  // Map available controllers
  const controllers: ControllerMap = {};

  for (const controllerPath of controllersPaths) {
    // All endpoints are mapped back to their parent controller
    const basename = path.basename(controllerPath);
    const resolvedControllerPath = path.join(controllerPath, `index${EXT}`);

    if (!checkControllerExists(controllerPath)) {
      const error = new Error(
        `Failed to load index.ts file for ${basename} controller. Ensure the controller is properly setup`,
      );

      reportTelemetryError(error);

      continue;
    }

    let settings = (await import(resolvedControllerPath)) as ControllerSettings;

    // @ts-expect-error default might no be available on import
    if (settings.default) settings = settings.default;

    controllers[basename] = { endpoints: [], settings };

    // Map available endpoints
    const endpointsPaths = await glob(
      path.join(controllerPath, "/{queries,mutators}/*"),
    );

    // Import and assimilate available endpoints
    for (const endpointPath of endpointsPaths) {
      const endpoint = await import(endpointPath);

      if (!endpoint.default) {
        throw new Error(`Invalid endpoint at ${endpointPath}`);
      }

      controllers[basename].endpoints.push(endpoint.default);
    }
  }

  return controllers;
}
