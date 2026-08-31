import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUIRED_PERMISSION } from "./permission.decorator";
import type { ContextRequest } from "../common/request-context";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<string>(REQUIRED_PERMISSION, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;
    const request = context.switchToHttp().getRequest<ContextRequest>();
    const user = request.context.user;
    if (!user) throw new ForbiddenException("Authenticated context is required.");
    if (user.roles.some((role) => role.code === "CITIS_SUPER_ADMIN") || user.permissions.includes(required)) return true;
    throw new ForbiddenException(`Permission required: ${required}`);
  }
}