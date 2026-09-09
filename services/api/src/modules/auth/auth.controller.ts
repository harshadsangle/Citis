import { Body, Controller, Get, HttpCode, Param, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { successResponse } from "../../common/response";
import type { ContextRequest } from "../../common/request-context";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import {
  ForgotPasswordDto,
  ChangePasswordDto,
  DirectStudentContactDto,
  DirectStudentOtpVerifyDto,
  DirectStudentRegistrationDto,
  LoginDto,
  MfaChallengeDto,
  MfaDisableDto,
  MfaEnrollmentDto,
  OtpRequestDto,
  OtpVerifyDto,
  ProviderDto,
  RegisterDto,
  ResetPasswordDto,
} from "./auth.dto";
import { CollegeStudentLoginDto } from "../college-students/college-students.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @HttpCode(200)
  async login(@Body() input: LoginDto, @Req() request: ContextRequest, @Res({ passthrough: true }) response: Response) {
    const session = await this.auth.login(input, request.context);
    if ("mfaRequired" in session) {
      response.setHeader("Cache-Control", "no-store");
      return successResponse(session, request);
    }
    response.cookie("citis_session", session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });
    return successResponse({ expiresAt: session.expiresAt.toISOString() }, request);
  }

  @Post("college-login")
  @HttpCode(200)
  async collegeLogin(@Body() input: CollegeStudentLoginDto, @Req() request: ContextRequest, @Res({ passthrough: true }) response: Response) {
    const session = await this.auth.collegeStudentLogin(input, request.context);
    if ("mfaRequired" in session) {
      response.setHeader("Cache-Control", "no-store");
      return successResponse(session, request);
    }
    response.cookie("citis_session", session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });
    return successResponse({ expiresAt: session.expiresAt.toISOString() }, request);
  }

  @Post("direct-students/register")
  @HttpCode(202)
  async registerDirectStudent(@Body() input: DirectStudentRegistrationDto, @Req() request: ContextRequest) {
    return successResponse(
      await this.auth.registerDirectStudent(input, {
        ipAddress: request.context.ipAddress,
        userAgent: request.context.userAgent,
      }),
      request,
    );
  }

  @Post("direct-students/otp/resend")
  @HttpCode(202)
  async resendDirectStudentOtp(@Body() input: DirectStudentContactDto, @Req() request: ContextRequest) {
    return successResponse(
      await this.auth.resendDirectStudentOtp(input, {
        ipAddress: request.context.ipAddress,
        userAgent: request.context.userAgent,
      }),
      request,
    );
  }

  @Post("direct-students/otp/verify")
  @HttpCode(200)
  async verifyDirectStudentOtp(
    @Body() input: DirectStudentOtpVerifyDto,
    @Req() request: ContextRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.verifyDirectStudentOtp(input, {
      ipAddress: request.context.ipAddress,
      userAgent: request.context.userAgent,
    });
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

  @Post("change-password")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async changePassword(@Body() input: ChangePasswordDto, @Req() request: ContextRequest) {
    const token = AuthGuard.tokenFrom(request);
    if (!token || !request.context.user) {
      throw new UnauthorizedException("Authentication is required.");
    }
    return successResponse(
      await this.auth.changePassword(request.context.user.id, input, request.context, token),
      request,
    );
  }

  @Get("mfa/status")
  @UseGuards(AuthGuard)
  async mfaStatus(@Req() request: ContextRequest) {
    return successResponse(await this.auth.mfaStatus(request.context.user!.id), request);
  }

  @Post("mfa/enroll")
  @UseGuards(AuthGuard)
  @HttpCode(202)
  async beginMfaEnrollment(@Body() input: MfaEnrollmentDto, @Req() request: ContextRequest) {
    return successResponse(
      await this.auth.beginMfaEnrollment(request.context.user!.id, input, request.context),
      request,
    );
  }

  @Post("mfa/enroll/verify")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async verifyMfaEnrollment(@Body() input: MfaChallengeDto, @Req() request: ContextRequest) {
    return successResponse(
      await this.auth.verifyMfaEnrollment(request.context.user!.id, input, request.context),
      request,
    );
  }

  @Post("mfa/reset")
  @UseGuards(AuthGuard)
  @HttpCode(202)
  async beginMfaReset(@Body() input: MfaEnrollmentDto, @Req() request: ContextRequest) {
    return successResponse(
      await this.auth.beginMfaReset(request.context.user!.id, input, request.context),
      request,
    );
  }

  @Post("mfa/reset/verify")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async verifyMfaReset(@Body() input: MfaChallengeDto, @Req() request: ContextRequest) {
    return successResponse(
      await this.auth.verifyMfaReset(request.context.user!.id, input, request.context),
      request,
    );
  }

  @Post("mfa/disable")
  @UseGuards(AuthGuard)
  @HttpCode(202)
  async beginMfaDisable(@Body() input: MfaDisableDto, @Req() request: ContextRequest) {
    return successResponse(
      await this.auth.beginMfaDisable(request.context.user!.id, input.currentPassword, request.context),
      request,
    );
  }

  @Post("mfa/disable/verify")
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async verifyMfaDisable(@Body() input: MfaChallengeDto, @Req() request: ContextRequest) {
    return successResponse(
      await this.auth.verifyMfaDisable(request.context.user!.id, input, request.context),
      request,
    );
  }

  @Post("mfa/login/verify")
  @HttpCode(200)
  async verifyMfaLogin(
    @Body() input: MfaChallengeDto,
    @Req() request: ContextRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.verifyMfaLogin(input, request.context);
    response.cookie("citis_session", session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });
    return successResponse({ expiresAt: session.expiresAt.toISOString() }, request);
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
  async requestOtp(@Body() input: OtpRequestDto, @Req() request: ContextRequest) {
    const result = await this.auth.requestOtp(input, request.context);
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