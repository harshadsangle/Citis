import { Controller, Get, Param, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import type { ContextRequest } from "../../common/request-context";
import { paginationFrom } from "../../common/pagination";
import { paginatedResponse, successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import { CertificateService } from "./certificate.service";
import { CertificateListQueryDto } from "./lms.dto";

@Controller("public/certificates")
export class PublicCertificateController {
  constructor(private readonly certificates: CertificateService) {}

  @Get("verify/:identifier")
  async verify(@Param("identifier") identifier: string, @Req() request: ContextRequest) {
    return successResponse(await this.certificates.verify(identifier, request.context.requestId), request);
  }
}

@Controller()
@UseGuards(AuthGuard, PermissionGuard)
export class CertificateController {
  constructor(private readonly certificates: CertificateService) {}

  @Get("certificates")
  @RequirePermission("lms.certificate.view")
  async list(@Req() request: ContextRequest, @Query() query: CertificateListQueryDto) {
    const page = paginationFrom(request);
    const result = await this.certificates.list(request.context.user!, page.page, page.pageSize, page.offset, query);
    return paginatedResponse(result.data, result.meta, request);
  }

  @Get("certificates/:id")
  @RequirePermission("lms.certificate.view")
  async get(@Param("id") id: string, @Req() request: ContextRequest) {
    return successResponse(await this.certificates.get(id, request.context.user!), request);
  }

  @Get("certificates/:id/download")
  @RequirePermission("lms.certificate.export")
  async download(@Param("id") id: string, @Req() request: ContextRequest, @Res() response: Response) {
    const file = await this.certificates.download(id, request);
    response.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="${file.filename.replace(/[\r\n"]/g, "")}"`);
    response.setHeader("Cache-Control", "private, no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    return response.send(file.content);
  }
}