import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rentcastGet } from "@/lib/property-data/rentcast-client";
import { RentCastError } from "@/lib/property-data/rentcast-errors";

const ORIGINAL_KEY = process.env.RENTCAST_API_KEY;

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

beforeEach(() => {
  process.env.RENTCAST_API_KEY = "test-key";
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (ORIGINAL_KEY === undefined) {
    delete process.env.RENTCAST_API_KEY;
  } else {
    process.env.RENTCAST_API_KEY = ORIGINAL_KEY;
  }
});

describe("rentcastGet — configuration", () => {
  it("throws missing_api_key and never calls fetch when RENTCAST_API_KEY is unset", async () => {
    delete process.env.RENTCAST_API_KEY;

    await expect(rentcastGet("/properties", { address: "1 Test St" })).rejects.toMatchObject({
      name: "RentCastError",
      kind: "missing_api_key",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the API key in the X-Api-Key header and the query params in the URL", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { ok: true }));

    await rentcastGet("/properties", { address: "514 Maple St, Detroit, MI" });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe(
      "https://api.rentcast.io/v1/properties?address=514+Maple+St%2C+Detroit%2C+MI",
    );
    expect((init?.headers as Record<string, string>)["X-Api-Key"]).toBe("test-key");
  });

  it("omits empty/undefined params from the query string", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, {}));

    await rentcastGet("/properties", { address: "1 Test St", city: undefined, state: "" });

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe("https://api.rentcast.io/v1/properties?address=1+Test+St");
  });
});

describe("rentcastGet — not-found vs. operational errors", () => {
  it("returns found:false on 400 rather than throwing", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(400, { status: 400, error: "resource/bad-request", message: "bad address" }),
    );
    const result = await rentcastGet("/properties", { address: "garbage" });
    expect(result).toEqual({ found: false });
  });

  it("returns found:false on 404", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(404, { status: 404, message: "not found" }));
    const result = await rentcastGet("/properties/does-not-exist", {});
    expect(result).toEqual({ found: false });
  });

  it.each([401, 403])("throws auth_failed on %i", async (status) => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(status, { status, message: "bad key" }));
    await expect(rentcastGet("/properties", { address: "1 Test St" })).rejects.toMatchObject({
      kind: "auth_failed",
      status,
    });
  });

  it("throws rate_limited on 429", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(429, { status: 429, error: "auth/rate-limit-exceeded", message: "too many requests" }),
    );
    await expect(rentcastGet("/properties", { address: "1 Test St" })).rejects.toMatchObject({
      kind: "rate_limited",
      status: 429,
    });
  });

  it("throws timeout on 504", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(504, { status: 504, message: "server timed out" }));
    await expect(rentcastGet("/properties", { address: "1 Test St" })).rejects.toMatchObject({
      kind: "timeout",
      status: 504,
    });
  });

  it("throws server_error on 500", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(500, { status: 500, message: "internal error" }));
    await expect(rentcastGet("/properties", { address: "1 Test St" })).rejects.toMatchObject({
      kind: "server_error",
      status: 500,
    });
  });

  it("throws timeout when the request aborts", async () => {
    vi.mocked(fetch).mockRejectedValue(new DOMException("The operation was aborted.", "AbortError"));
    await expect(rentcastGet("/properties", { address: "1 Test St" })).rejects.toMatchObject({
      kind: "timeout",
    });
  });

  it("throws network_error on a generic fetch failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("fetch failed"));
    await expect(rentcastGet("/properties", { address: "1 Test St" })).rejects.toMatchObject({
      kind: "network_error",
    });
  });

  it("throws unexpected_response when a 200 body isn't valid JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("not json", { status: 200 }));
    await expect(rentcastGet("/properties", { address: "1 Test St" })).rejects.toMatchObject({
      kind: "unexpected_response",
    });
  });
});

describe("rentcastGet — success", () => {
  it("returns found:true with the parsed body", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, [{ id: "rc-1" }]));
    const result = await rentcastGet<{ id: string }[]>("/properties", { address: "1 Test St" });
    expect(result).toEqual({ found: true, data: [{ id: "rc-1" }] });
  });
});

describe("RentCastError", () => {
  it("is an instance of Error with a matching kind", () => {
    const error = new RentCastError("server_error", "boom");
    expect(error).toBeInstanceOf(Error);
    expect(error.kind).toBe("server_error");
  });
});
