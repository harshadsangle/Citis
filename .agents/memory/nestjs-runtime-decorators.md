---
name: NestJS runtime decorators
description: Runtime requirement for NestJS constructor dependency injection in this workspace
---

NestJS API development must use a runner that preserves legacy decorator and parameter metadata; esbuild-only TypeScript runners can start the app while silently leaving injected services undefined.

**Why:** The foundation API initially appeared to boot under an esbuild-based runner, but controller and service constructor injection was incomplete at runtime. A TypeScript compiler-backed runner exposed and resolved the actual module wiring.

**How to apply:** Keep `experimentalDecorators` and `emitDecoratorMetadata` enabled in the API TypeScript configuration and use a compiler-backed development runner for Nest startup. Keep API tests on a runner that can load the same decorator-based modules.