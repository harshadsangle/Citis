"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalEnvironmentPath = getLocalEnvironmentPath;
exports.loadLocalEnvironment = loadLocalEnvironment;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const dotenv_1 = __importDefault(require("dotenv"));
function localEnvironmentCandidates() {
    // Resolve these roots from the API source location first. This is stable
    // when npm launches the API from the repository root, the API workspace, or
    // a Windows shell with a different current directory.
    const apiRoot = (0, node_path_1.resolve)(__dirname, "../..");
    const repositoryRoot = (0, node_path_1.resolve)(apiRoot, "..");
    // Windows local development owns the repository root .env.local. Do not
    // fall back to the API-local file there: that file is the Replit/Linux
    // override and may contain an internal-only database host.
    // Replit runs on Linux and keeps the API-local file as its existing first
    // choice.
    const roots = (process.platform === "win32"
        ? [repositoryRoot]
        : [apiRoot, process.env.INIT_CWD, process.cwd(), repositoryRoot])
        .filter((root) => Boolean(root))
        .map((root) => (0, node_path_1.resolve)(root));
    return [...new Set(roots)].map((root) => (0, node_path_1.resolve)(root, ".env.local"));
}
function getLocalEnvironmentPath() {
    return localEnvironmentCandidates().find((candidate) => (0, node_fs_1.existsSync)(candidate));
}
function loadLocalEnvironment() {
    const localEnvPath = getLocalEnvironmentPath();
    if (!localEnvPath)
        return;
    // Local files override inherited platform values. On Windows the repository
    // root file wins; on Linux/Replit the API-local file remains authoritative.
    dotenv_1.default.config({ path: localEnvPath, override: true, quiet: true });
}
loadLocalEnvironment();
//# sourceMappingURL=load-env.js.map