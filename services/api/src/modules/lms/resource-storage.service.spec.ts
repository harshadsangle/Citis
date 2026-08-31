import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { BadRequestException } from "@nestjs/common";
import { ResourceStorageService } from "./resource-storage.service";

test("managed documents are stored under a tenant/resource key and can be read back", async () => {
  const directory = await mkdtemp(join(tmpdir(), "citis-lms-"));
  const previousDirectory = process.env.LMS_STORAGE_DIR;
  process.env.LMS_STORAGE_DIR = directory;
  try {
    const storage = new ResourceStorageService();
    const stored = await storage.storeDocument("tenant-a", "resource-a", {
      originalname: "../course-notes.PDF",
      mimetype: "application/pdf",
      size: 7,
      buffer: Buffer.from("content"),
    });
    assert.match(stored.storageKey, /^tenant-a\/resource-a\/[0-9a-f-]+\.pdf$/);
    assert.deepEqual(await storage.read(stored.storageKey), Buffer.from("content"));
    assert.equal((await readFile(join(directory, stored.storageKey))).toString(), "content");
    await assert.rejects(storage.read("../../outside"), BadRequestException);
  } finally {
    if (previousDirectory === undefined) delete process.env.LMS_STORAGE_DIR;
    else process.env.LMS_STORAGE_DIR = previousDirectory;
    await rm(directory, { recursive: true, force: true });
  }
});

test("SCORM uploads reject invalid archives before creating a package directory", async () => {
  const directory = await mkdtemp(join(tmpdir(), "citis-scorm-"));
  const previousDirectory = process.env.LMS_STORAGE_DIR;
  process.env.LMS_STORAGE_DIR = directory;
  try {
    const storage = new ResourceStorageService();
    await assert.rejects(
      storage.storeScormPackage("tenant-a", "resource-a", {
        originalname: "course.zip",
        mimetype: "application/zip",
        size: 4,
        buffer: Buffer.from("nope"),
      }),
      BadRequestException,
    );
    assert.deepEqual((await readFile(directory).catch(() => Buffer.from(""))), Buffer.from(""));
  } finally {
    if (previousDirectory === undefined) delete process.env.LMS_STORAGE_DIR;
    else process.env.LMS_STORAGE_DIR = previousDirectory;
    await rm(directory, { recursive: true, force: true });
  }
});