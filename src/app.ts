import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import Logger from "./core/Logger";
import { environment } from "./config";
import "./database"; // initialize database
import { NotFoundError, ApiError, InternalError } from "./core/ApiError";
import routesV1 from "./routes/v1";

process.on("uncaughtException", e => {
  Logger.error(e);
});

const app = express();

app.use(
  express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 })
);
app.use(express.json({ limit: "10mb" }));
app.use(cors({ credentials: true, origin: true }));

app.set("trust proxy", false);

// Routes
app.use("/v1", routesV1);

// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

// Middleware Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
  } else {
    if (environment === "development") {
      Logger.error(err);
      res.status(500).json({ message: err.message, status: 500, data: null });
      return;
    }
    ApiError.handle(new InternalError(), res);
  }
});

export default app;
