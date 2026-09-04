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
    const repositoryRoot = (0, node_path_1.resolve)(apiRoot, "../..");
    const roots = [apiRoot, process.env.INIT_CWD, process.cwd(), repositoryRoot]
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
    // The API-local file is preferred when present; the repository root file is
    // the supported fallback used by the Windows local setup. Platform-provided
    // values remain the fallback only when neither local file exists.
    dotenv_1.default.config({ path: localEnvPath, override: true, quiet: true });
}
loadLocalEnvironment();
//# sourceMappingURL=load-env.js.map