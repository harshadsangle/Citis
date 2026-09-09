import { Module } from "@nestjs/common";
import { LmsController } from "./lms.controller";
import { LmsService } from "./lms.service";
import { ResourceStorageService } from "./resource-storage.service";
import { AssessmentService } from "./assessment.service";
import { CertificateController, PublicCertificateController } from "./certificate.controller";
import { CertificateService } from "./certificate.service";
import { LmsContentRateLimiter } from "./lms.rate-limit";
import { ReportController } from "./report.controller";
import { ReportService } from "./report.service";

@Module({
  controllers: [LmsController, CertificateController, PublicCertificateController, ReportController],
  providers: [LmsService, ResourceStorageService, AssessmentService, CertificateService, LmsContentRateLimiter, ReportService],
})
export class LmsModule {}