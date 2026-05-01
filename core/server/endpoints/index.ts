/**
 * Map all endpoints in the Controllers user directory to a single runtime
 * object. This is useful to avoid exporting/importing multiple endpoints
 * during runtime, mimicking Rails' autoload feature.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { glob } from "glob";

import type { ControllerMap, ControllerSettings, Endpoint } from "../endpoints/types";
import { reportTelemetryError } from "../telemetry";

const IS_BUILT = __filename.endsWith(".mjs");
// Em dev o tsx/corre ficheiros `.ts`; build gera `.mjs`.
const INDEX_EXT = IS_BUILT ? ".mjs" : ".ts";

/** No Windows, import() dinâmico exige URL `file://`, não `C:\...`. */
function importModule<T>(fsPath: string): Promise<T> {
  const absolute = path.resolve(fsPath);
  return import(pathToFileURL(absolute).href) as Promise<T>;
}

/** O pacote glob não trata bem `\\` nem `{a,b}` com caminhos Windows — usamos sempre padrões POSIX. */
function globPattern(dir: string, ...parts: string[]): string {
  return path.posix.join(
    dir.split(path.sep).join(path.posix.sep),
    ...parts,
  );
}

function controllerIndexFile(controllerPath: string) {
  return path.join(controllerPath, `index${INDEX_EXT}`);
}

function checkControllerExists(controllerPath: string) {
  return existsSync(controllerIndexFile(controllerPath));
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
  const controllersPaths = await glob(globPattern(controllersPath, "*"));

  // Map available controllers
  const controllers: ControllerMap = {};

  for (const controllerPath of controllersPaths) {
    // All endpoints are mapped back to their parent controller
    const basename = path.basename(controllerPath);
    const resolvedControllerPath = controllerIndexFile(controllerPath);

    if (!checkControllerExists(controllerPath)) {
      const error = new Error(
        `Failed to load index.ts file for ${basename} controller. Ensure the controller is properly setup`,
      );

      reportTelemetryError(error);

      continue;
    }

    let settings = (await importModule<ControllerSettings>(
      resolvedControllerPath,
    )) as ControllerSettings;

    // @ts-expect-error default might no be available on import
    if (settings.default) settings = settings.default;

    controllers[basename] = { endpoints: [], settings };

    // Map available endpoints
    const queries = await glob(globPattern(controllerPath, "queries", "*"));
    const mutators = await glob(globPattern(controllerPath, "mutators", "*"));
    const endpointsPaths = [...queries, ...mutators];

    // Import and assimilate available endpoints
    for (const endpointPath of endpointsPaths) {
      const mod = await importModule<{ default?: Endpoint }>(endpointPath);

      if (!mod.default) {
        throw new Error(`Invalid endpoint at ${endpointPath}`);
      }

      controllers[basename].endpoints.push(mod.default);
    }
  }

  return controllers;
}
