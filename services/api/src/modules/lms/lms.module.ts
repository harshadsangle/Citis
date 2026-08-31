import { Module } from "@nestjs/common";
import { LmsController } from "./lms.controller";
import { LmsService } from "./lms.service";
import { ResourceStorageService } from "./resource-storage.service";
import { AssessmentService } from "./assessment.service";

@Module({
  controllers: [LmsController],
  providers: [LmsService, ResourceStorageService, AssessmentService],
})
export class LmsModule {}