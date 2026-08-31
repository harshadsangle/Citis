import { Module } from "@nestjs/common";
import { LmsController } from "./lms.controller";
import { LmsService } from "./lms.service";
import { ResourceStorageService } from "./resource-storage.service";
import { AssessmentService } from "./assessment.service";
import { CertificateController, PublicCertificateController } from "./certificate.controller";
import { CertificateService } from "./certificate.service";

@Module({
  controllers: [LmsController, CertificateController, PublicCertificateController],
  providers: [LmsService, ResourceStorageService, AssessmentService, CertificateService],
})
export class LmsModule {}