import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { paginationFrom } from "../../common/pagination";
import { paginatedResponse, successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import { AcademicStructureService } from "./academic-structure.service";
import { CreateDepartmentDto, CreateFacultyDto, CreateOfferingDto, CreateSemesterDto, UpdateAcademicDto } from "./academic-structure.dto";
@Controller("academic")
@UseGuards(AuthGuard, PermissionGuard)
export class AcademicStructureController {
 constructor(private readonly service: AcademicStructureService) {}
 private async list(kind: string, req: ContextRequest, query: Record<string,string>) { const p=paginationFrom(req); const r=await this.service.list(kind,req.context.user!,p.page,p.pageSize,p.offset,query); return paginatedResponse(r.data,r.meta,req); }
 @Get("faculties") @RequirePermission("lms.faculty.view") faculties(@Req() r:ContextRequest,@Query() q:Record<string,string>){return this.list("faculties",r,q);}
 @Get("departments") @RequirePermission("lms.department.view") departments(@Req() r:ContextRequest,@Query() q:Record<string,string>){return this.list("departments",r,q);}
 @Get("semesters") @RequirePermission("lms.semester.view") semesters(@Req() r:ContextRequest,@Query() q:Record<string,string>){return this.list("semesters",r,q);}
 @Get("course-offerings") @RequirePermission("lms.course_offering.view") offerings(@Req() r:ContextRequest,@Query() q:Record<string,string>){return this.list("course-offerings",r,q);}
 @Post("faculties") @RequirePermission("lms.faculty.create") async createFaculty(@Body() d:CreateFacultyDto,@Req()r:ContextRequest){return successResponse(await this.service.create("faculties",d,r),r);}
 @Post("departments") @RequirePermission("lms.department.create") async createDepartment(@Body() d:CreateDepartmentDto,@Req()r:ContextRequest){return successResponse(await this.service.create("departments",d,r),r);}
 @Post("semesters") @RequirePermission("lms.semester.create") async createSemester(@Body() d:CreateSemesterDto,@Req()r:ContextRequest){return successResponse(await this.service.create("semesters",d,r),r);}
 @Post("course-offerings") @RequirePermission("lms.course_offering.create") async createOffering(@Body() d:CreateOfferingDto,@Req()r:ContextRequest){return successResponse(await this.service.create("course-offerings",d,r),r);}
 @Patch("faculties/:id") @RequirePermission("lms.faculty.update") async updateFaculty(@Param("id")id:string,@Body()d:UpdateAcademicDto,@Req()r:ContextRequest){return successResponse(await this.service.update("faculties",id,d,r),r);}
 @Patch("departments/:id") @RequirePermission("lms.department.update") async updateDepartment(@Param("id")id:string,@Body()d:UpdateAcademicDto,@Req()r:ContextRequest){return successResponse(await this.service.update("departments",id,d,r),r);}
 @Patch("semesters/:id") @RequirePermission("lms.semester.update") async updateSemester(@Param("id")id:string,@Body()d:UpdateAcademicDto,@Req()r:ContextRequest){return successResponse(await this.service.update("semesters",id,d,r),r);}
 @Patch("course-offerings/:id") @RequirePermission("lms.course_offering.update") async updateOffering(@Param("id")id:string,@Body()d:UpdateAcademicDto,@Req()r:ContextRequest){return successResponse(await this.service.update("course-offerings",id,d,r),r);}
 @Post("faculties/:id/archive") @RequirePermission("lms.faculty.archive") async archiveFaculty(@Param("id")id:string,@Req()r:ContextRequest){return successResponse(await this.service.update("faculties",id,{status:"ARCHIVED"},r),r);}
 @Post("departments/:id/archive") @RequirePermission("lms.department.archive") async archiveDepartment(@Param("id")id:string,@Req()r:ContextRequest){return successResponse(await this.service.update("departments",id,{status:"ARCHIVED"},r),r);}
 @Post("semesters/:id/archive") @RequirePermission("lms.semester.archive") async archiveSemester(@Param("id")id:string,@Req()r:ContextRequest){return successResponse(await this.service.update("semesters",id,{status:"ARCHIVED"},r),r);}
 @Post("course-offerings/:id/archive") @RequirePermission("lms.course_offering.archive") async archiveOffering(@Param("id")id:string,@Req()r:ContextRequest){return successResponse(await this.service.update("course-offerings",id,{status:"ARCHIVED"},r),r);}
}