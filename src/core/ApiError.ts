import { Response } from "express";
import { environment } from "../config";
import {
  AuthFailureResponse,
  AccessTokenErrorResponse,
  InternalErrorResponse,
  NotFoundResponse,
  BadRequestResponse,
  ForbiddenResponse
} from "./ApiResponse";
import Logger from "./Logger";

enum ErrorType {
  BAD_TOKEN = "BadTokenError",
  TOKEN_EXPIRED = "TokenExpiredError",
  UNAUTHORIZED = "AuthFailureError",
  ACCESS_TOKEN = "AccessTokenError",
  INTERNAL = "InternalError",
  NOT_FOUND = "NotFoundError",
  NO_ENTRY = "NoEntryError",
  NO_DATA = "NoDataError",
  BAD_REQUEST = "BadRequestError",
  FORBIDDEN = "ForbiddenError"
}

export abstract class ApiError extends Error {
  constructor(public type?: ErrorType, public message: string = "error") {
    super(type);
  }

  public static handle(err: ApiError, res: Response): Response {
    Logger.error("Error: ", err);
    switch (err.type) {
      case ErrorType.BAD_TOKEN:
      case ErrorType.TOKEN_EXPIRED:
      case ErrorType.UNAUTHORIZED:
        return new AuthFailureResponse(err.message).send(res);
      case ErrorType.ACCESS_TOKEN:
        return new AccessTokenErrorResponse(err.message).send(res);
      case ErrorType.INTERNAL:
        return new InternalErrorResponse(err.message).send(res);
      case ErrorType.NOT_FOUND:
      case ErrorType.NO_ENTRY:
      case ErrorType.NO_DATA:
        return new NotFoundResponse(err.message).send(res);
      case ErrorType.BAD_REQUEST:
        return new BadRequestResponse(err.message).send(res);
      case ErrorType.FORBIDDEN:
        return new ForbiddenResponse(err.message).send(res);
      default: {
        let { message } = err;
        // Do not send failure message in production as it may send sensitive data
        if (environment === "production") {
          message =
            "Something wrong happened. Please contact your administrator";
        }
        return new InternalErrorResponse(message).send(res);
      }
    }
  }
}

export class AuthFailureError extends ApiError {
  constructor(message = "Invalid Credentials") {
    super(ErrorType.UNAUTHORIZED, message);
    Object.setPrototypeOf(this, AuthFailureError.prototype);
  }
}

export class InternalError extends ApiError {
  constructor(message = "Internal error") {
    super(ErrorType.INTERNAL, message);
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad Request") {
    super(ErrorType.BAD_REQUEST, message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not Found") {
    super(ErrorType.NOT_FOUND, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Permission denied") {
    super(ErrorType.FORBIDDEN, message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NoEntryError extends ApiError {
  constructor(message = "Entry does not exist") {
    super(ErrorType.NO_ENTRY, message);
    Object.setPrototypeOf(this, NoEntryError.prototype);
  }
}

export class BadTokenError extends ApiError {
  constructor(message = "Token is not valid") {
    super(ErrorType.BAD_TOKEN, message);
    Object.setPrototypeOf(this, BadTokenError.prototype);
  }
}

export class PaymentFailureError extends ApiError {
  constructor(message = "Unable to make payment") {
    super(ErrorType.BAD_TOKEN, message);
    Object.setPrototypeOf(this, BadTokenError.prototype);
  }
}

export class TokenExpiredError extends ApiError {
  constructor(message = "Token is expired") {
    super(ErrorType.TOKEN_EXPIRED, message);
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }
}

export class NoDataError extends ApiError {
  constructor(message = "No data available") {
    super(ErrorType.NO_DATA, message);
    Object.setPrototypeOf(this, NoDataError.prototype);
  }
}

export class AccessTokenError extends ApiError {
  constructor(message = "Invalid access token") {
    super(ErrorType.ACCESS_TOKEN, message);
    Object.setPrototypeOf(this, AccessTokenError.prototype);
  }
}
