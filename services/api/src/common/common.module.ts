import { Global, Module } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { PermissionGuard } from "../guards/permission.guard";

@Global()
@Module({
  providers: [AuditService, PermissionGuard],
  exports: [AuditService, PermissionGuard],
})
export class CommonModule {}