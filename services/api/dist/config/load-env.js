"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const dotenv_1 = __importDefault(require("dotenv"));
const localEnvCandidates = [
    (0, node_path_1.resolve)(process.cwd(), ".env.local"),
    (0, node_path_1.resolve)(process.cwd(), "../../.env.local"),
    (0, node_path_1.resolve)((0, node_path_1.dirname)(__dirname), "../../../.env.local"),
];
const localEnvPath = localEnvCandidates.find((candidate, index, candidates) => candidates.indexOf(candidate) === index && (0, node_fs_1.existsSync)(candidate));
if (localEnvPath) {
    // Keep platform-provided environment variables authoritative over local files.
    dotenv_1.default.config({ path: localEnvPath, override: false });
}
//# sourceMappingURL=load-env.js.map