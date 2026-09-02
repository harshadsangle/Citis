import { Body, Controller, Get, HttpCode, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { successResponse } from "../../common/response";
import type { ContextRequest } from "../../common/request-context";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import {
  ForgotPasswordDto,
  LoginDto,
  OtpRequestDto,
  OtpVerifyDto,
  ProviderDto,
  RegisterDto,
  ResetPasswordDto,
} from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @HttpCode(200)
  async login(@Body() input: LoginDto, @Req() request: ContextRequest, @Res({ passthrough: true }) response: Response) {
    const session = await this.auth.login(input, request.context);
    response.cookie("citis_session", session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });
    return successResponse({ expiresAt: session.expiresAt.toISOString() }, request);
  }

  @Post("register")
  @HttpCode(201)
  async register(@Body() input: RegisterDto, @Req() request: ContextRequest) {
    return successResponse(
      await this.auth.register(input, {
        ipAddress: request.context.ipAddress,
        userAgent: request.headers["user-agent"],
      }),
      request,
    );
  }

  @Post("forgot-password")
  @HttpCode(202)
  async forgotPassword(@Body() input: ForgotPasswordDto, @Req() request: ContextRequest) {
    return successResponse(
      await this.auth.requestPasswordReset(input, {
        ipAddress: request.context.ipAddress,
        userAgent: request.headers["user-agent"],
      }),
      request,
    );
  }

  @Post("reset-password/:token")
  @HttpCode(200)
  async resetPassword(@Param("token") token: string, @Body() input: ResetPasswordDto, @Req() request: ContextRequest) {
    return successResponse(await this.auth.resetPassword(token, input), request);
  }

  @Get("verify-email/:token")
  @HttpCode(200)
  async verifyEmail(@Param("token") token: string, @Req() request: ContextRequest) {
    return successResponse(await this.auth.verifyEmail(token), request);
  }

  @Post("logout")
  @HttpCode(200)
  async logout(@Req() request: ContextRequest, @Res({ passthrough: true }) response: Response) {
    const token = AuthGuard.tokenFrom(request);
    if (token) await this.auth.logout(token);
    response.clearCookie("citis_session", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
    return successResponse({ loggedOut: true }, request);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@Req() request: ContextRequest) {
    return successResponse(request.context.user, request);
  }

  @Post("otp/request")
  @HttpCode(202)
  async requestOtp(@Body() input: OtpRequestDto, @Req() request: Request) {
    const result = await this.auth.requestOtp(input);
    return successResponse(result, request);
  }

  @Post("otp/verify")
  @HttpCode(200)
  async verifyOtp(@Body() input: OtpVerifyDto, @Req() request: ContextRequest, @Res({ passthrough: true }) response: Response) {
    const session = await this.auth.verifyOtp(input, request.context);
    response.cookie("citis_session", session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });
    return successResponse({ expiresAt: session.expiresAt.toISOString() }, request);
  }

  @Post("providers/status")
  @HttpCode(200)
  providerStatus(@Body() input: ProviderDto, @Req() request: Request) {
    return successResponse(this.auth.providerStatus(input.provider), request);
  }
}