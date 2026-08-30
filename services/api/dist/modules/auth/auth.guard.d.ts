import { CanActivate, ExecutionContext } from "@nestjs/common";
import type { ContextRequest } from "../../common/request-context";
import { AuthService } from "./auth.service";
export declare class AuthGuard implements CanActivate {
    private readonly auth;
    constructor(auth: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    static tokenFrom(request: ContextRequest): string;
}
