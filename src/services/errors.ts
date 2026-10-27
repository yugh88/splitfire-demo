export type ErrorCode = "bad_request" | "not_found" | "conflict" | "internal_error";

export class ServiceError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details: string[];

  constructor(status: number, code: ErrorCode, message: string, details: string[] = []) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details: string[] = []): ServiceError {
  return new ServiceError(400, "bad_request", message, details);
}

export function notFound(message: string): ServiceError {
  return new ServiceError(404, "not_found", message);
}

export function conflict(message: string): ServiceError {
  return new ServiceError(409, "conflict", message);
}
