import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CommonModule } from "./common/common.module";
import { DatabaseModule } from "./database/database.module";
import { PermissionGuard } from "./guards/permission.guard";
import { AuditModule } from "./modules/audit/audit.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CampusesModule } from "./modules/campuses/campuses.module";
import { InstitutionsModule } from "./modules/institutions/institutions.module";
import { ModulesModule } from "./modules/modules/modules.module";
import { RbacModule } from "./modules/rbac/rbac.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CommonModule,
    AuthModule,
    TenantsModule,
    InstitutionsModule,
    CampusesModule,
    UsersModule,
    RbacModule,
    ModulesModule,
    AuditModule,
  ],
  providers: [PermissionGuard],
})
export class AppModule {}