"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Logger_1 = __importDefault(require("./core/Logger"));
var config_1 = require("./config");
var app_1 = __importDefault(require("./app"));
app_1.default
    .listen(config_1.port, function () {
    Logger_1.default.info("server running on port : " + config_1.port);
})
    .on("error", function (e) { return Logger_1.default.error(e); });
