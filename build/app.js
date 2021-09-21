"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var Logger_1 = __importDefault(require("./core/Logger"));
var config_1 = require("./config");
require("./database"); // initialize database
var ApiError_1 = require("./core/ApiError");
var v1_1 = __importDefault(require("./routes/v1"));
process.on("uncaughtException", function (e) {
    Logger_1.default.error(e);
});
var app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }));
app.use(express_1.default.json({ limit: "10mb" }));
app.use((0, cors_1.default)({ origin: config_1.corsUrl, optionsSuccessStatus: 200 }));
// Routes
app.use("/v1", v1_1.default);
// catch 404 and forward to error handler
app.use(function (req, res, next) { return next(new ApiError_1.NotFoundError()); });
// Middleware Error Handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(function (err, req, res, next) {
    if (err instanceof ApiError_1.ApiError) {
        ApiError_1.ApiError.handle(err, res);
    }
    else {
        if (config_1.environment === "development") {
            Logger_1.default.error(err);
            res.status(500).send(err.message);
            return;
        }
        ApiError_1.ApiError.handle(new ApiError_1.InternalError(), res);
    }
});
exports.default = app;
