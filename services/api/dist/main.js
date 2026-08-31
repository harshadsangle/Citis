"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const errors_filter_1 = require("./common/errors.filter");
const request_context_1 = require("./common/request-context");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix("api/v1");
    app.use(request_context_1.requestContextMiddleware);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new errors_filter_1.ApiExceptionFilter());
    app.enableCors({
        origin: process.env.WEB_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean) || true,
        credentials: true,
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle("CITIS Education Platform API")
        .setDescription("Phase 0 multi-tenant foundation API for the CITIS Education Platform.")
        .setVersion("1.0")
        .addCookieAuth("citis_session")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup("api/docs", app, document);
    const port = Number(process.env.PORT || 4000);
    await app.listen(port, "0.0.0.0");
    console.log(`CITIS foundation API listening on port ${port}`);
}
bootstrap().catch((error) => {
    console.error("API startup failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
//# sourceMappingURL=main.js.map