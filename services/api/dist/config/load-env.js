"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const dotenv_1 = __importDefault(require("dotenv"));
const projectRoots = [
    process.env.INIT_CWD,
    process.cwd(),
    (0, node_path_1.resolve)((0, node_path_1.dirname)(__dirname), "../../../"),
].filter((root) => Boolean(root));
const localEnvPath = projectRoots
    .map((root) => (0, node_path_1.resolve)(root, ".env.local"))
    .find((candidate, index, candidates) => candidates.indexOf(candidate) === index && (0, node_fs_1.existsSync)(candidate));
if (localEnvPath) {
    // In local development, the explicit .env.local file is the source of truth.
    // Platform-provided values remain the fallback when no local file exists.
    dotenv_1.default.config({ path: localEnvPath, override: true, quiet: true });
}
//# sourceMappingURL=load-env.js.map