import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '@src/auth/service/auth.service';
import { SignInRequest, SignUpRequest } from '@src/auth/interface/auth.request';
import { UserTokenResponse } from '@src/auth/interface/auth.response';
import { JwtRefreshTokenGuard } from '@src/auth/jwt/refresh-token.guard';
import { BaseResponse } from '@src/common/interface/http.response';
import { AuthCategoryEnum } from '@src/auth/auth.enum';
import { JwtAccessTokenGuard } from '@src/auth/jwt/access-token.guard';
import { BaseRequest } from '@src/common/interface/http.request';

@Controller('auth/v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @summary 로그인
   * @tag auth
   * @param req
   * @return UserTokenResponse
   * @throw 400 upsert_data_error 유저 토큰 생성 실패
   * @throw 401 unauthorized_error 존재하지 않는 유저에 대한 로그인 시도
   */
  @TypedRoute.Post('sign-in')
  async signIn(@TypedBody() req: SignInRequest): Promise<BaseResponse<UserTokenResponse>> {
    const userToken = await this.authService.signIn({
      category: <AuthCategoryEnum>req.category,
      identification: req.identification,
      password: req.password,
    });
    return {
      data: userToken,
    };
  }

  /**
   * @summary 회원가입
   * @tag auth
   * @param req
   * @returns UserTokenResponse
   * @throw 400 create_data_error 데이터 생성 실패
   * @throw 401 unauthorized_error 이미 회원가입된 유저에 대해 회원가입 시도
   * */
  @TypedRoute.Post('sign-up')
  async signUp(@TypedBody() req: SignUpRequest): Promise<BaseResponse<UserTokenResponse>> {
    const userToken = await this.authService.signUp({
      nickname: req.nickname,
      category: <AuthCategoryEnum>req.category,
      identification: req.identification,
      password: req.password,
    });
    return {
      data: userToken,
    };
  }

  /**
   * @summary 로그아웃
   * @tag auth
   * @param req
   * @returns {data: null}
   * @throw 400 delete_error - 데이터 삭제 실패 에러
   * */
  @UseGuards(JwtAccessTokenGuard)
  @TypedRoute.Post('sign-out')
  async signOut(@Req() req: BaseRequest): Promise<BaseResponse<null>> {
    await this.authService.signOut(req.user.userId);

    return {
      data: null,
    };
  }

  /**
   * @summary 유저 탈퇴 - 호출 시 모든 연관 데이터가 hard delete 됨
   * @tag auth
   * @param req
   * @returns {data: null}
   * @throw 400 delete_error - 데이터 삭제 실패 에러
   * */
  @UseGuards(JwtAccessTokenGuard)
  @TypedRoute.Delete('withdrawal')
  async withdrawAuth(@Req() req: BaseRequest): Promise<BaseResponse<null>> {
    await this.authService.withdrawAuth(req.user.userId);

    return {
      data: null,
    };
  }

  /**
   * @summary 토큰 리프래시
   * @tag auth
   * @param req RefreshRequest
   * @returns UserTokenResponse
   * @throw 400 upsert_data_error 유저 토큰 생성 실패
   * @throw 401 refresh_token_expired_error 리프래시 토큰 만료 / unauthorized_error 헤더에 토큰이 없는 경우 / unauthorized_token_error 기타 토큰 에러
   */
  @TypedRoute.Patch('refresh')
  @UseGuards(JwtRefreshTokenGuard)
  async refreshUserToken(@Req() req: BaseRequest): Promise<BaseResponse<UserTokenResponse>> {
    const updatedToken = await this.authService.refreshUserToken(req.user.userId);
    return {
      data: updatedToken,
    };
  }
}
