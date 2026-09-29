import assert from "node:assert/strict";
import test from "node:test";
import { expandWebOrigins, isOriginAllowed, normalizeOrigin } from "./cors-origin";

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

test("expandWebOrigins pairs apex and www for citisinfotech.in", () => {
  const expanded = expandWebOrigins(["https://www.citisinfotech.in", "https://lms.citisinfotech.in"]);
  assert.equal(expanded.includes("https://citisinfotech.in"), true);
  assert.equal(expanded.includes("https://www.citisinfotech.in"), true);
});