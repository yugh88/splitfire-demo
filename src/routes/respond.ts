import type { IncomingMessage, ServerResponse } from "node:http";

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = body === undefined ? "" : JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

export function sendNoContent(res: ServerResponse): void {
  res.writeHead(204);
  res.end();
}

export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk as Buffer));
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    return undefined;
  }
}

export interface ParsedRequest {
  pathname: string;
  segments: string[];
  query: URLSearchParams;
}

export function parseRequest(req: IncomingMessage): ParsedRequest {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  return {
    pathname: url.pathname,
    segments: url.pathname.split("/").filter(Boolean),
    query: url.searchParams,
  };
}
