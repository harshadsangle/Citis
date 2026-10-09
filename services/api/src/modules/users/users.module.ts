import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { StudentLoginActivityService } from "./student-login-activity.service";

@Module({ controllers: [UsersController], providers: [UsersService, StudentLoginActivityService] })
export class UsersModule {}