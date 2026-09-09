import { Module } from "@nestjs/common";
import { CollegeStudentsController } from "./college-students.controller";
import { CollegeStudentsService } from "./college-students.service";

@Module({
  controllers: [CollegeStudentsController],
  providers: [CollegeStudentsService],
})
export class CollegeStudentsModule {}