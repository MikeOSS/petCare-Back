import type { FastifyCorsOptions } from "@fastify/cors";

import { IS_DEV } from "@/core/config";

/**
 * Em desenvolvimento aceitamos qualquer origem do browser (localhost:3000, :8081, 127.0.0.1, etc.).
 * Se FRONT_END_ORIGIN estiver no .env mas a app Expo abrir noutra porta (ex.: 3000 vs 8081), uma lista
 * fixa de origens faz o CORS falhar — por isso em dev usamos sempre reflexão da origem do pedido.
 *
 * Em produção: define FRONT_END_ORIGIN com uma ou mais URLs separadas por vírgula.
 */
export function getCorsOrigin(): FastifyCorsOptions["origin"] {
  if (IS_DEV) {
    return (origin, cb) => {
      if (!origin) {
        return cb(null, true);
      }
      return cb(null, origin);
    };
  }

  const raw = process.env.FRONT_END_ORIGIN?.trim();
  if (raw) {
    const list = raw.split(",").map((o) => o.trim()).filter(Boolean);
    if (list.length === 0) return false;
    if (list.length === 1) return list[0]!;
    return list;
  }

  console.warn(
    "[cors] FRONT_END_ORIGIN não está definido. Sem isto, browsers em produção podem bloquear a API.",
  );
  return false;
}
