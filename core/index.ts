import "./config";
import "./server/telemetry";

import startServer from "./server";
import { reportTelemetryError } from "./server/telemetry";

// Initialize the server
async function init() {
  await startServer();
}

try {
  init();
} catch (err) {
  reportTelemetryError(err);
}

process.on("uncaughtException", reportTelemetryError);
