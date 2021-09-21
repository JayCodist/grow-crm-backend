"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var ApiResponse_1 = require("../../core/ApiResponse");
var router = express_1.default.Router();
/*-------------------------------------------------------------------------*/
// Below all APIs are public APIs protected by api-key
router.use('/', function (req, res) {
    return new ApiResponse_1.SuccessResponse("Done!", { name: "Ukaegbu Justice" }).send(res);
});
/*-------------------------------------------------------------------------*/
// router.use('/signup', signup);
// router.use('/login', login);
// router.use('/logout', logout);
// router.use('/token', token);
// router.use('/blogs', blogList);
// router.use('/blog', blogDetail);
// router.use('/writer/blog', writer);
// router.use('/editor/blog', editor);
// router.use('/profile', user);
exports.default = router;
