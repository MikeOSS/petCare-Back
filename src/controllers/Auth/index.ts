import { ControllerSettings } from "@/core/server/endpoints/types";

// Todas as rotas desta pasta ficam em /auth/... (login, registo, etc.).
const settings: ControllerSettings = {
  prefix: "auth",
};

export default settings;
