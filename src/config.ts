type Environment = "production" | "development";

// Mapper for environment variables
export const environment: Environment = process.env.NODE_ENV as Environment;
export const port = process.env.PORT || "8080";

export const db = {
  name: process.env.DB_NAME || "",
  host: process.env.DB_HOST || "",
  port: process.env.DB_PORT || "",
  user: process.env.DB_USER || "",
  password: process.env.DB_USER_PWD || ""
};

export const corsUrl = process.env.CORS_URL;

export const tokenInfo = {
  accessTokenValidityDays: parseInt(
    process.env.ACCESS_TOKEN_VALIDITY_SEC || "0",
    10
  ),
  refreshTokenValidityDays: parseInt(
    process.env.REFRESH_TOKEN_VALIDITY_SEC || "0",
    10
  ),
  issuer: process.env.TOKEN_ISSUER || "",
  audience: process.env.TOKEN_AUDIENCE || ""
};

export const logDirectory = process.env.LOG_DIR;
