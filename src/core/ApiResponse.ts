import { Response } from "express";

enum ResponseStatus {
  SUCCESS = 200,
  SUCCESS_BUT_CAVEAT = 214,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  USER_UPGRADE_REQUIRED = 436,
  INTERNAL_ERROR = 500
}

export abstract class ApiResponse {
  public data?: any;

  constructor(public status: ResponseStatus, public message: string) {}

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

export class SuccessResponse extends ApiResponse {
  constructor(message: string, _data: any) {
    super(ResponseStatus.SUCCESS, message);
    this.data = _data;
  }

  send(res: Response): Response {
    return super.prepare<SuccessResponse>(res, this);
  }
}

export class SuccessButCaveatResponse extends ApiResponse {
  constructor(message: string, _data: any) {
    super(ResponseStatus.SUCCESS_BUT_CAVEAT, message);
    this.data = _data;
  }

  send(res: Response): Response {
    return super.prepare<SuccessResponse>(res, this);
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

export class UserUpgradeRequiredResponse extends ApiResponse {
  constructor(message = "Upgrade of legacy user required") {
    super(ResponseStatus.USER_UPGRADE_REQUIRED, message);
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
