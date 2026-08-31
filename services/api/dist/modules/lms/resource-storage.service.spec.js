"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const promises_1 = require("node:fs/promises");
const node_os_1 = require("node:os");
const node_path_1 = require("node:path");
const node_test_1 = __importDefault(require("node:test"));
const common_1 = require("@nestjs/common");
const resource_storage_service_1 = require("./resource-storage.service");
(0, node_test_1.default)("managed documents are stored under a tenant/resource key and can be read back", async () => {
    const directory = await (0, promises_1.mkdtemp)((0, node_path_1.join)((0, node_os_1.tmpdir)(), "citis-lms-"));
    const previousDirectory = process.env.LMS_STORAGE_DIR;
    process.env.LMS_STORAGE_DIR = directory;
    try {
        const storage = new resource_storage_service_1.ResourceStorageService();
        const stored = await storage.storeDocument("tenant-a", "resource-a", {
            originalname: "../course-notes.PDF",
            mimetype: "application/pdf",
            size: 7,
            buffer: Buffer.from("content"),
        });
        strict_1.default.match(stored.storageKey, /^tenant-a\/resource-a\/[0-9a-f-]+\.pdf$/);
        strict_1.default.deepEqual(await storage.read(stored.storageKey), Buffer.from("content"));
        strict_1.default.equal((await (0, promises_1.readFile)((0, node_path_1.join)(directory, stored.storageKey))).toString(), "content");
        await strict_1.default.rejects(storage.read("../../outside"), common_1.BadRequestException);
    }
    finally {
        if (previousDirectory === undefined)
            delete process.env.LMS_STORAGE_DIR;
        else
            process.env.LMS_STORAGE_DIR = previousDirectory;
        await (0, promises_1.rm)(directory, { recursive: true, force: true });
    }
});
(0, node_test_1.default)("SCORM uploads reject invalid archives before creating a package directory", async () => {
    const directory = await (0, promises_1.mkdtemp)((0, node_path_1.join)((0, node_os_1.tmpdir)(), "citis-scorm-"));
    const previousDirectory = process.env.LMS_STORAGE_DIR;
    process.env.LMS_STORAGE_DIR = directory;
    try {
        const storage = new resource_storage_service_1.ResourceStorageService();
        await strict_1.default.rejects(storage.storeScormPackage("tenant-a", "resource-a", {
            originalname: "course.zip",
            mimetype: "application/zip",
            size: 4,
            buffer: Buffer.from("nope"),
        }), common_1.BadRequestException);
        strict_1.default.deepEqual((await (0, promises_1.readFile)(directory).catch(() => Buffer.from(""))), Buffer.from(""));
    }
    finally {
        if (previousDirectory === undefined)
            delete process.env.LMS_STORAGE_DIR;
        else
            process.env.LMS_STORAGE_DIR = previousDirectory;
        await (0, promises_1.rm)(directory, { recursive: true, force: true });
    }
});
//# sourceMappingURL=resource-storage.service.spec.js.map