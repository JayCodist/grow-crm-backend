require("dotenv").config();

export type Environment = "production" | "development" | "test";

// Mapper for environment variables
export const environment: Environment =
  (process.env.NODE_ENV as Environment) || "development";
export const port = process.env.PORT || "8080";

export const db = {
  name: process.env.DB_NAME || "",
  host: process.env.DB_HOST || "",
  port: process.env.DB_PORT || "",
  user: process.env.DB_USER || "",
  password: process.env.DB_USER_PWD || ""
};

export const corsUrl = "*";

export const tokenInfo = {
  accessTokenValidityDays: 30,
  refreshTokenValidityDays: 120,
  issuer: "https://grow-crm.web.app",
  audience: "https://grow-crm.web.app"
};

export const logDirectory = "./logs";
