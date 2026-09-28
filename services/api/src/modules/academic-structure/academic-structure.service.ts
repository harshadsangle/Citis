import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import { AuditService } from "../../common/audit.service";
import { assertScope, assertScopeForRead, filterScopedRows } from "../../common/access-scope";
import type { AuthenticatedUser, ContextRequest } from "../../common/request-context";
import { paginationMeta } from "../../common/pagination";
import type { CreateDepartmentDto, CreateFacultyDto, CreateOfferingDto, CreateSemesterDto, UpdateAcademicDto } from "./academic-structure.dto";
const tables: Record<string,string> = { faculties:"academic_faculties", departments:"academic_departments", semesters:"academic_semesters", "course-offerings":"academic_course_offerings" };
@Injectable()
export class AcademicStructureService {
 constructor(private readonly db:DatabaseService, private readonly audit:AuditService){}
 private table(kind:string){const t=tables[kind];if(!t)throw new BadRequestException("Unknown academic resource.");return t;}
 async list(kind:string,user:AuthenticatedUser,page:number,size:number,offset:number,q:Record<string,string>){
  const table=this.table(kind), values:unknown[]=[user.tenantId,size,offset];
  const filters:string[]=["a.tenant_id=$1"]; if(q.institutionId){assertScopeForRead(user,q.institutionId);filters.push("a.institution_id=$4");(values as unknown[]).push(q.institutionId);}
  if(q.facultyId){filters.push(`a.faculty_id=$${values.length+1}`);(values as unknown[]).push(q.facultyId);}
  if(q.semesterId){filters.push(`a.semester_id=$${values.length+1}`);(values as unknown[]).push(q.semesterId);}
  const result=await this.db.query(`SELECT a.* FROM ${table} a WHERE ${filters.join(" AND ")} ORDER BY a.created_at DESC LIMIT $2 OFFSET $3`,values);
  const rows=filterScopedRows(user,result.rows as Array<Record<string,unknown>>,"institution_id","campus_id");
  return {data:rows,meta:paginationMeta(page,size,rows.length)};
 }
 async create(kind:string,input:CreateFacultyDto|CreateDepartmentDto|CreateSemesterDto|CreateOfferingDto,request:ContextRequest){
  const user=request.context.user!, table=this.table(kind); assertScope(user,input.institutionId);
  let fields:string[] = [], vals:unknown[] = [];
  if(kind==="faculties"||kind==="departments"){const d=input as CreateDepartmentDto;fields=["tenant_id","institution_id","campus_id","name","code","description","created_by","updated_by"];vals=[user.tenantId,d.institutionId,d.campusId??null,d.name.trim(),d.code.trim().toUpperCase(),d.description?.trim()??null,user.id,user.id];if(kind==="departments"){fields.splice(5,0,"faculty_id");vals.splice(5,0,d.facultyId);}}
  else if(kind==="semesters"){const d=input as CreateSemesterDto;fields=["tenant_id","institution_id","campus_id","code","name","start_date","end_date","created_by","updated_by"];vals=[user.tenantId,d.institutionId,d.campusId??null,d.code.trim().toUpperCase(),d.name.trim(),d.startDate,d.endDate,user.id,user.id];}
  else {const d=input as CreateOfferingDto;fields=["tenant_id","institution_id","course_id","semester_id","campus_id","section","created_by","updated_by"];vals=[user.tenantId,d.institutionId,d.courseId,d.semesterId,d.campusId??null,d.section??"",user.id,user.id];}
  const r=await this.db.query(`INSERT INTO ${table} (${fields.join(",")}) VALUES (${fields.map((_,i)=>`$${i+1}`).join(",")}) RETURNING *`,vals);const row=r.rows[0];
  await this.audit.record({tenantId:user.tenantId,institutionId:input.institutionId,actorUserId:user.id,requestId:request.context.requestId,module:"lms",resource:kind,resourceId:row.id,action:"CREATE",newValue:row});return row;
 }
 async update(kind:string,id:string,input:UpdateAcademicDto,request:ContextRequest){const user=request.context.user!,table=this.table(kind);const before=await this.db.query(`SELECT * FROM ${table} WHERE id=$1 AND tenant_id=$2`,[id,user.tenantId]);if(!before.rows[0])throw new NotFoundException("Academic record not found.");assertScope(user,before.rows[0].institution_id,before.rows[0].campus_id);
  const status=input.status;
  if (kind==="semesters" && status && !["DRAFT","ACTIVE","CLOSED","ARCHIVED"].includes(status)) throw new BadRequestException("Invalid semester status.");
  if ((kind==="faculties"||kind==="departments") && status && !["ACTIVE","ARCHIVED"].includes(status)) throw new BadRequestException("Invalid academic unit status.");
  const set=kind==="semesters"||kind==="course-offerings" ? "status=COALESCE($3,status)" : "name=COALESCE($3,name),description=COALESCE($4,description),status=COALESCE($5,status)";
  const params=kind==="semesters"||kind==="course-offerings" ? [id,user.id,status??null,user.tenantId] : [id,user.id,input.name?.trim()??null,input.description?.trim()??null,status??null,user.tenantId];
  const r=await this.db.query(`UPDATE ${table} SET ${set},updated_by=$2,updated_at=now() WHERE id=$1 AND tenant_id=$${params.length} RETURNING *`,params);const row=r.rows[0];await this.audit.record({tenantId:user.tenantId,institutionId:row.institution_id,actorUserId:user.id,requestId:request.context.requestId,module:"lms",resource:kind,resourceId:id,action:"UPDATE",previousValue:before.rows[0],newValue:row});return row;
 }
}