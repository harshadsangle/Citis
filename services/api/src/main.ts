import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { ApiExceptionFilter } from "./common/errors.filter";
import { requestContextMiddleware } from "./common/request-context";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  app.use(requestContextMiddleware);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableCors({
    origin: process.env.WEB_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean) || true,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("CITIS Education Platform API")
    .setDescription("Phase 0 multi-tenant foundation API for the CITIS Education Platform.")
    .setVersion("1.0")
    .addCookieAuth("citis_session")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  const port = Number(process.env.PORT || 4000);
  await app.listen(port, "0.0.0.0");
  console.log(`CITIS foundation API listening on port ${port}`);
}

bootstrap().catch((error) => {
  console.error("API startup failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});