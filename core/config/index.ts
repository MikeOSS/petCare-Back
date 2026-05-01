import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const IS_DEV = (process.env.NODE_ENV || "development") == "development";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV !== "test") {
  console.warn(
    "[config] JWT_SECRET não está definido. Login e cookies vão falhar até criares uma chave no .env",
  );
}

export const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || "development",
  BASE_URL: process.env.FRONT_END_ORIGIN,
  IS_DEV: IS_DEV,
  SECURITY: {
    JWT_SECRET: jwtSecret || "",
  },
};