import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import { RequestMethod } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { HealthController } from "./health.controller";

test("versioned health endpoint checks database availability and returns success", async () => {
  const queries: string[] = [];
  const controller = new HealthController({
    query: async (query: string) => {
      queries.push(query);
      return { rows: [{ "?column?": 1 }] };
    },
  } as never);

  assert.deepEqual(await controller.check(), { status: "ok" });
  assert.deepEqual(queries, ["SELECT 1"]);
  assert.equal(Reflect.getMetadata(PATH_METADATA, HealthController), "health");
  assert.equal(Reflect.getMetadata(PATH_METADATA, HealthController.prototype.check), "/");
  assert.equal(Reflect.getMetadata(METHOD_METADATA, HealthController.prototype.check), RequestMethod.GET);
});