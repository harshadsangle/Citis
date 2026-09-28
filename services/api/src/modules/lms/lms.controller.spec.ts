import assert from "node:assert/strict";
import test from "node:test";
import type { Response } from "express";
import type { ContextRequest } from "../../common/request-context";
import { LmsController } from "./lms.controller";

function responseRecorder() {
  const headers = new Map<string, string>();
  let sentBody: unknown;
  const response = {
    setHeader(name: string, value: string) {
      headers.set(name, value);
      return this;
    },
    send(body: unknown) {
      sentBody = body;
      return this;
    },
  } as unknown as Response;

  return { response, headers, sentBody: () => sentBody };
}

test("SCORM assets keep inline delivery and set nosniff plus same-site CORP", async () => {
  const content = Buffer.from("<!doctype html><title>SCORM</title>");
  const request = {} as ContextRequest;
  const serviceCalls: unknown[][] = [];
  const controller = new LmsController({
    getScormAsset: async (...args: unknown[]) => {
      serviceCalls.push(args);
      return { content, mimeType: "text/html" };
    },
  } as never, {} as never);
  const recorder = responseRecorder();

  await controller.serveScormAsset("resource-1", "index.html", request, recorder.response);

  assert.deepEqual(serviceCalls, [["resource-1", "index.html", request]]);
  assert.equal(recorder.headers.get("Content-Type"), "text/html");
  assert.equal(recorder.headers.get("Content-Disposition"), "inline");
  assert.equal(recorder.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(recorder.headers.get("Cross-Origin-Resource-Policy"), "same-site");
  assert.equal(recorder.headers.has("Content-Security-Policy"), false);
  assert.equal(recorder.sentBody(), content);
});

test("SCORM asset lookup failures do not send a response", async () => {
  const controller = new LmsController({
    getScormAsset: async () => {
      throw new Error("SCORM asset access denied");
    },
  } as never, {} as never);
  const recorder = responseRecorder();

  await assert.rejects(
    controller.serveScormAsset("resource-1", "index.html", {} as ContextRequest, recorder.response),
    /SCORM asset access denied/,
  );

  assert.equal(recorder.headers.size, 0);
  assert.equal(recorder.sentBody(), undefined);
});