import type { Application, Request, Response } from "express";

export function registerRootHealthEndpoint(app: Pick<Application, "get">) {
  app.get("/health", (_request: Request, response: Response) => (
    response.status(200).json({ status: "ok" })
  ));
}