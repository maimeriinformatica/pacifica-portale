// =====================================================================
// sigv4.ts — firma AWS Signature V4 per URL "presigned" (query auth).
// Solo WebCrypto: gira su Deno (Edge Function) e su Node (per i test).
// Riferimento: docs AWS "Authenticating Requests: Using Query
// Parameters (AWS Signature Version 4)".
// =====================================================================

const enc = new TextEncoder();

async function hmac(key: ArrayBuffer | Uint8Array, msg: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey("raw", key as ArrayBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", k, enc.encode(msg));
}
async function sha256hex(msg: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", enc.encode(msg));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
// RFC 3986: encodeURIComponent piu' ! ' ( ) *
function uri(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}
function uriPath(s: string): string { return s.split("/").map(uri).join("/"); }

export interface PresignInput {
  endpoint: string; region: string; bucket: string;
  accessKeyId: string; secretAccessKey: string;
  key: string; contentType: string; expiresSec: number;
  method?: string; now?: Date;
}

export async function presignPut(inp: PresignInput): Promise<string> {
  const method = inp.method || "PUT";
  const now = inp.now || new Date();
  const amzdate = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z"; // YYYYMMDDTHHMMSSZ
  const datestamp = amzdate.slice(0, 8);
  const service = "s3";
  const host = new URL(inp.endpoint).host;
  // path-style: /bucket/key (funziona su AWS, R2, B2)
  const path = inp.bucket ? `/${inp.bucket}/${inp.key}` : `/${inp.key}`;
  const scope = `${datestamp}/${inp.region}/${service}/aws4_request`;

  const q: [string, string][] = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${inp.accessKeyId}/${scope}`],
    ["X-Amz-Date", amzdate],
    ["X-Amz-Expires", String(inp.expiresSec)],
    ["X-Amz-SignedHeaders", "host"],
  ];
  const canonicalQuery = q.map(([k, v]) => `${uri(k)}=${uri(v)}`).sort().join("&");
  const canonicalRequest = [
    method, uriPath(path), canonicalQuery, `host:${host}\n`, "host", "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256", amzdate, scope, await sha256hex(canonicalRequest),
  ].join("\n");
  const kDate = await hmac(enc.encode("AWS4" + inp.secretAccessKey), datestamp);
  const kRegion = await hmac(kDate, inp.region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  const signature = hex(await hmac(kSigning, stringToSign));
  return `${inp.endpoint.replace(/\/$/, "")}${path}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
