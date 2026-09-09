import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { AuthService } from "./auth.service";

function sessionToken(request: ContextRequest) {
  const authorization = request.header("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    const token = authorization.slice(7).trim();
    return token.length <= 256 ? token : "";
  }
  const cookie = request.header("cookie")?.match(/(?:^|;\s*)citis_session=([^;]+)/);
  if (!cookie) return "";
  try {
    const token = decodeURIComponent(cookie[1]);
    return token.length <= 256 ? token : "";
  } catch {
    return "";
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<ContextRequest>();
    const token = sessionToken(request);
    const user = token ? await this.auth.resolveSession(token) : null;
    if (!user) throw new UnauthorizedException("Authentication is required.");
    request.context.user = user;
    return true;
  }

  static tokenFrom(request: ContextRequest) {
    return sessionToken(request);
  }
}