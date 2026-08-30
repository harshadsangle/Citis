import { Module } from "@nestjs/common";
import { LmsController } from "./lms.controller";
import { LmsService } from "./lms.service";
import { ResourceStorageService } from "./resource-storage.service";

@Module({
  controllers: [LmsController],
  providers: [LmsService, ResourceStorageService],
})
export class LmsModule {}