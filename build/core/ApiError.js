"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessTokenError = exports.NoDataError = exports.TokenExpiredError = exports.BadTokenError = exports.NoEntryError = exports.ForbiddenError = exports.NotFoundError = exports.BadRequestError = exports.InternalError = exports.AuthFailureError = exports.ApiError = void 0;
var config_1 = require("../config");
var ApiResponse_1 = require("./ApiResponse");
var ErrorType;
(function (ErrorType) {
    ErrorType["BAD_TOKEN"] = "BadTokenError";
    ErrorType["TOKEN_EXPIRED"] = "TokenExpiredError";
    ErrorType["UNAUTHORIZED"] = "AuthFailureError";
    ErrorType["ACCESS_TOKEN"] = "AccessTokenError";
    ErrorType["INTERNAL"] = "InternalError";
    ErrorType["NOT_FOUND"] = "NotFoundError";
    ErrorType["NO_ENTRY"] = "NoEntryError";
    ErrorType["NO_DATA"] = "NoDataError";
    ErrorType["BAD_REQUEST"] = "BadRequestError";
    ErrorType["FORBIDDEN"] = "ForbiddenError";
})(ErrorType || (ErrorType = {}));
var ApiError = /** @class */ (function (_super) {
    __extends(ApiError, _super);
    function ApiError(type, message) {
        if (message === void 0) { message = 'error'; }
        var _this = _super.call(this, type) || this;
        _this.type = type;
        _this.message = message;
        return _this;
    }
    ApiError.handle = function (err, res) {
        switch (err.type) {
            case ErrorType.BAD_TOKEN:
            case ErrorType.TOKEN_EXPIRED:
            case ErrorType.UNAUTHORIZED:
                return new ApiResponse_1.AuthFailureResponse(err.message).send(res);
            case ErrorType.ACCESS_TOKEN:
                return new ApiResponse_1.AccessTokenErrorResponse(err.message).send(res);
            case ErrorType.INTERNAL:
                return new ApiResponse_1.InternalErrorResponse(err.message).send(res);
            case ErrorType.NOT_FOUND:
            case ErrorType.NO_ENTRY:
            case ErrorType.NO_DATA:
                return new ApiResponse_1.NotFoundResponse(err.message).send(res);
            case ErrorType.BAD_REQUEST:
                return new ApiResponse_1.BadRequestResponse(err.message).send(res);
            case ErrorType.FORBIDDEN:
                return new ApiResponse_1.ForbiddenResponse(err.message).send(res);
            default: {
                var message = err.message;
                // Do not send failure message in production as it may send sensitive data
                if (config_1.environment === 'production')
                    message = 'Something wrong happened.';
                return new ApiResponse_1.InternalErrorResponse(message).send(res);
            }
        }
    };
    return ApiError;
}(Error));
exports.ApiError = ApiError;
var AuthFailureError = /** @class */ (function (_super) {
    __extends(AuthFailureError, _super);
    function AuthFailureError(message) {
        if (message === void 0) { message = 'Invalid Credentials'; }
        return _super.call(this, ErrorType.UNAUTHORIZED, message) || this;
    }
    return AuthFailureError;
}(ApiError));
exports.AuthFailureError = AuthFailureError;
var InternalError = /** @class */ (function (_super) {
    __extends(InternalError, _super);
    function InternalError(message) {
        if (message === void 0) { message = 'Internal error'; }
        return _super.call(this, ErrorType.INTERNAL, message) || this;
    }
    return InternalError;
}(ApiError));
exports.InternalError = InternalError;
var BadRequestError = /** @class */ (function (_super) {
    __extends(BadRequestError, _super);
    function BadRequestError(message) {
        if (message === void 0) { message = 'Bad Request'; }
        return _super.call(this, ErrorType.BAD_REQUEST, message) || this;
    }
    return BadRequestError;
}(ApiError));
exports.BadRequestError = BadRequestError;
var NotFoundError = /** @class */ (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(message) {
        if (message === void 0) { message = 'Not Found'; }
        return _super.call(this, ErrorType.NOT_FOUND, message) || this;
    }
    return NotFoundError;
}(ApiError));
exports.NotFoundError = NotFoundError;
var ForbiddenError = /** @class */ (function (_super) {
    __extends(ForbiddenError, _super);
    function ForbiddenError(message) {
        if (message === void 0) { message = 'Permission denied'; }
        return _super.call(this, ErrorType.FORBIDDEN, message) || this;
    }
    return ForbiddenError;
}(ApiError));
exports.ForbiddenError = ForbiddenError;
var NoEntryError = /** @class */ (function (_super) {
    __extends(NoEntryError, _super);
    function NoEntryError(message) {
        if (message === void 0) { message = "Entry don't exists"; }
        return _super.call(this, ErrorType.NO_ENTRY, message) || this;
    }
    return NoEntryError;
}(ApiError));
exports.NoEntryError = NoEntryError;
var BadTokenError = /** @class */ (function (_super) {
    __extends(BadTokenError, _super);
    function BadTokenError(message) {
        if (message === void 0) { message = 'Token is not valid'; }
        return _super.call(this, ErrorType.BAD_TOKEN, message) || this;
    }
    return BadTokenError;
}(ApiError));
exports.BadTokenError = BadTokenError;
var TokenExpiredError = /** @class */ (function (_super) {
    __extends(TokenExpiredError, _super);
    function TokenExpiredError(message) {
        if (message === void 0) { message = 'Token is expired'; }
        return _super.call(this, ErrorType.TOKEN_EXPIRED, message) || this;
    }
    return TokenExpiredError;
}(ApiError));
exports.TokenExpiredError = TokenExpiredError;
var NoDataError = /** @class */ (function (_super) {
    __extends(NoDataError, _super);
    function NoDataError(message) {
        if (message === void 0) { message = 'No data available'; }
        return _super.call(this, ErrorType.NO_DATA, message) || this;
    }
    return NoDataError;
}(ApiError));
exports.NoDataError = NoDataError;
var AccessTokenError = /** @class */ (function (_super) {
    __extends(AccessTokenError, _super);
    function AccessTokenError(message) {
        if (message === void 0) { message = 'Invalid access token'; }
        return _super.call(this, ErrorType.ACCESS_TOKEN, message) || this;
    }
    return AccessTokenError;
}(ApiError));
exports.AccessTokenError = AccessTokenError;
