import { Controller, Get, Param, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import type { ContextRequest } from "../../common/request-context";
import { successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import { CertificateReportQueryDto } from "./lms.dto";
import { ReportService } from "./report.service";

@Controller("reports")
@UseGuards(AuthGuard, PermissionGuard)
export class ReportController {
  constructor(private readonly reports: ReportService) {}

  @Get(":report/export")
  @RequirePermission("lms.report.export")
  async export(@Param("report") report: string, @Query() query: CertificateReportQueryDto, @Req() request: ContextRequest, @Res() response: Response) {
    const file = await this.reports.csv(report, query, request.context.user!);
    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
    response.setHeader("Cache-Control", "private, no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    return response.send(file.content);
  }

  @Get(":report")
  @RequirePermission("lms.report.view")
  async report(@Param("report") report: string, @Query() query: CertificateReportQueryDto, @Req() request: ContextRequest) {
    return successResponse(await this.reports.run(report, query, request.context.user!), request);
  }
}