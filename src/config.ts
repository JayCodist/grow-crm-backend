require("dotenv").config();

type Environment = "production" | "development";

// Mapper for environment variables
export const environment: Environment =
  (process.env.NODE_ENV as Environment) || "development";
export const port = process.env.PORT || "8080";

export const db = {
  name: process.env.DB_NAME || "grow_crm_db_test",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || "27017",
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
