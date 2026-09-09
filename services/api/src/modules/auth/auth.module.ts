import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";
import { AuthRateLimiter } from "./auth.rate-limit";
import { AuthService } from "./auth.service";

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AuthRateLimiter],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}