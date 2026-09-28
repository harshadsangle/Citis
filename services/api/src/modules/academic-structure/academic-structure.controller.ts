import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { paginationFrom } from "../../common/pagination";
import { paginatedResponse, successResponse } from "../../common/response";
import { RequirePermission } from "../../guards/permission.decorator";
import { PermissionGuard } from "../../guards/permission.guard";
import { AuthGuard } from "../auth/auth.guard";
import { AcademicStructureService } from "./academic-structure.service";
import { CreateDepartmentDto, CreateFacultyDto, CreateOfferingDto, CreateSemesterDto, UpdateAcademicDto } from "./academic-structure.dto";
@Controller()
@UseGuards(AuthGuard, PermissionGuard)
export class AcademicStructureController {
 constructor(private readonly service: AcademicStructureService) {}
 private async list(kind: string, req: ContextRequest, query: Record<string,string>) { const p=paginationFrom(req); const r=await this.service.list(kind,req.context.user!,p.page,p.pageSize,p.offset,query); return paginatedResponse(r.data,r.meta,req); }
 @Get("faculties") @RequirePermission("lms.faculty.view") faculties(@Req() r:ContextRequest,@Query() q:Record<string,string>){return this.list("faculties",r,q);}
 @Get("departments") @RequirePermission("lms.department.view") departments(@Req() r:ContextRequest,@Query() q:Record<string,string>){return this.list("departments",r,q);}
 @Get("semesters") @RequirePermission("lms.semester.view") semesters(@Req() r:ContextRequest,@Query() q:Record<string,string>){return this.list("semesters",r,q);}
 @Get("course-offerings") @RequirePermission("lms.course_offering.view") offerings(@Req() r:ContextRequest,@Query() q:Record<string,string>){return this.list("course-offerings",r,q);}
 @Post("faculties") @RequirePermission("lms.faculty.create") createFaculty(@Body() d:CreateFacultyDto,@Req()r:ContextRequest){return successResponse(this.service.create("faculties",d,r),r);}
 @Post("departments") @RequirePermission("lms.department.create") createDepartment(@Body() d:CreateDepartmentDto,@Req()r:ContextRequest){return successResponse(this.service.create("departments",d,r),r);}
 @Post("semesters") @RequirePermission("lms.semester.create") createSemester(@Body() d:CreateSemesterDto,@Req()r:ContextRequest){return successResponse(this.service.create("semesters",d,r),r);}
 @Post("course-offerings") @RequirePermission("lms.course_offering.create") createOffering(@Body() d:CreateOfferingDto,@Req()r:ContextRequest){return successResponse(this.service.create("course-offerings",d,r),r);}
 @Patch(":kind/:id") update(@Param("kind")k:string,@Param("id")id:string,@Body()d:UpdateAcademicDto,@Req()r:ContextRequest){return successResponse(this.service.update(k,id,d,r),r);}
 @Post(":kind/:id/archive") archive(@Param("kind")k:string,@Param("id")id:string,@Req()r:ContextRequest){return successResponse(this.service.update(k,id,{status:"ARCHIVED"},r),r);}
}