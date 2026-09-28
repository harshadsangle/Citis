import assert from "node:assert/strict";
import test from "node:test";
import { isOriginAllowed, normalizeOrigin } from "./cors-origin";

test("CORS configured and incoming origins normalize trailing slashes consistently", () => {
  const allowedOrigins = new Set(
    " https://lms.example.com/ ,https://admin.example.com/// "
      .split(",")
      .map(normalizeOrigin)
      .filter(Boolean),
  );

  assert.deepEqual([...allowedOrigins], ["https://lms.example.com", "https://admin.example.com"]);
  assert.equal(isOriginAllowed("https://lms.example.com/", allowedOrigins), true);
  assert.equal(isOriginAllowed(" https://admin.example.com/// ", allowedOrigins), true);
  assert.equal(isOriginAllowed("https://unlisted.example.com", allowedOrigins), false);
  assert.equal(isOriginAllowed(undefined, allowedOrigins), true);
});