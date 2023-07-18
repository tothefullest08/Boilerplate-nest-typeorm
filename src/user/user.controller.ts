import { Controller } from '@nestjs/common';

import { UserService } from '@src/user/service/user.service';
import { TypedParam, TypedRoute } from '@nestia/core';
import { BaseResponse } from '@src/common/interface/http.response';
import { UserResponse } from '@src/user/interface/user.response';

@Controller('users/v1')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * @summary 유저 조회
   * @tag user
   * @throw 400 get_data_error - 조회 실패 에러
   * @return 유저 데이터
   */
  @TypedRoute.Get('/:userId')
  async getUser(@TypedParam('userId', 'string') userId: string): Promise<BaseResponse<UserResponse>> {
    const user = await this.userService.getUser(userId);
    return { data: user };
  }
}
