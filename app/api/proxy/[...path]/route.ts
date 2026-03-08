import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function proxy(req: NextRequest): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;
  const apiPath = pathname.replace(/^\/api\/proxy/, "");
  const normalizedPath = apiPath.replace(/\/+$/, "") + "/";
  const search = req.nextUrl.search;
  const url = `${BACKEND}${normalizedPath}${search}`;

  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const csrf = req.headers.get("x-csrftoken");
  if (csrf) headers.set("x-csrftoken", csrf);
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);

  let body: BodyInit | null = null;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const buffer = await req.arrayBuffer();
    if (buffer.byteLength > 0) body = buffer;
  }

  const upstream = await fetch(url, { method: req.method, headers, body });

  const resHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    resHeaders.append(key, value);
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
