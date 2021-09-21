import { Response } from "express";

enum ResponseStatus {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500
}

abstract class ApiResponse {
  constructor(private status: ResponseStatus, private message: string) {}

  protected prepare<T extends ApiResponse>(
    res: Response,
    apiResponse: T
  ): Response {
    return res.status(this.status).json(apiResponse);
  }

  public send(res: Response): Response {
    return this.prepare<ApiResponse>(res, this);
  }
}

export class SuccessResponse<T> extends ApiResponse {
  constructor(message: string, private data: T) {
    super(ResponseStatus.SUCCESS, message);
  }

  send(res: Response): Response {
    return super.prepare<SuccessResponse<T>>(res, this);
  }
}

export class AuthFailureResponse extends ApiResponse {
  constructor(message = "Authentication Failure") {
    super(ResponseStatus.UNAUTHORIZED, message);
  }
}

export class NotFoundResponse extends ApiResponse {
  private url: string | undefined;

  constructor(message = "Not Found") {
    super(ResponseStatus.NOT_FOUND, message);
  }

  send(res: Response): Response {
    this.url = res.req?.originalUrl;
    return super.prepare<NotFoundResponse>(res, this);
  }
}

export class ForbiddenResponse extends ApiResponse {
  constructor(message = "Forbidden") {
    super(ResponseStatus.FORBIDDEN, message);
  }
}

export class BadRequestResponse extends ApiResponse {
  constructor(message = "Bad Parameters") {
    super(ResponseStatus.BAD_REQUEST, message);
  }
}

export class InternalErrorResponse extends ApiResponse {
  constructor(message = "Internal Error") {
    super(ResponseStatus.INTERNAL_ERROR, message);
  }
}

export class SuccessMsgResponse extends ApiResponse {
  constructor(message: string) {
    super(ResponseStatus.SUCCESS, message);
  }
}

export class FailureMsgResponse extends ApiResponse {
  constructor(message: string) {
    super(ResponseStatus.SUCCESS, message);
  }
}

export class AccessTokenErrorResponse extends ApiResponse {
  private instruction = "refresh_token";

  constructor(message = "Access token invalid") {
    super(ResponseStatus.UNAUTHORIZED, message);
  }

  send(res: Response): Response {
    res.setHeader("instruction", this.instruction);
    return super.prepare<AccessTokenErrorResponse>(res, this);
  }
}

export class TokenRefreshResponse extends ApiResponse {
  constructor(
    message: string,
    private accessToken: string,
    private refreshToken: string
  ) {
    super(ResponseStatus.SUCCESS, message);
  }

  send(res: Response): Response {
    return super.prepare<TokenRefreshResponse>(res, this);
  }
}
