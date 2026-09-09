import "reflect-metadata";
import "./config/load-env";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NextFunction, Request, Response } from "express";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/errors.filter";
import { requestContextMiddleware } from "./common/request-context";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  app.getHttpAdapter().getInstance().set("trust proxy", 1);
  app.use(requestContextMiddleware);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.use((_request: Request, response: Response, next: NextFunction) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (process.env.NODE_ENV === "production") {
      response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });
  const allowedOrigins = (process.env.WEB_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (process.env.NODE_ENV === "production" && allowedOrigins.length === 0) {
    throw new Error("WEB_ORIGIN must be configured in production.");
  }
  const allowedOriginSet = new Set(allowedOrigins);
  app.enableCors({
    origin: allowedOrigins.length
      ? (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => callback(null, !origin || allowedOriginSet.has(origin))
      : true,
    credentials: true,
  });

  if (process.env.NODE_ENV !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("CITIS Education Platform API")
      .setDescription("Phase 0 multi-tenant foundation API for the CITIS Education Platform.")
      .setVersion("1.0")
      .addCookieAuth("citis_session")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, document);
  }

  const port = Number(process.env.PORT || 4000);
  await app.listen(port, "0.0.0.0");
  console.log(`CITIS foundation API listening on port ${port}`);
}

bootstrap().catch((error) => {
  console.error("API startup failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});