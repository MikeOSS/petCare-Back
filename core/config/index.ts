import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const IS_DEV = (process.env.NODE_ENV || "development") == "development";

export const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || "development",
  BASE_URL: process.env.FRONT_END_ORIGIN,
  IS_DEV: IS_DEV,
};