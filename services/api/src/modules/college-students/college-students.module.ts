import { Module } from "@nestjs/common";
import { LmsModule } from "../lms/lms.module";
import { CollegeStudentsController } from "./college-students.controller";
import { CollegeStudentsService } from "./college-students.service";

@Module({
  imports: [LmsModule],
  controllers: [CollegeStudentsController],
  providers: [CollegeStudentsService],
})
export class CollegeStudentsModule {}