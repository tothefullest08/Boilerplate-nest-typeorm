import { Module } from '@nestjs/common';
import { UserController } from '@src/user/user.controller';
import { UserService } from '@src/user/service/user.service';
import { UserRepository } from '@src/user/repository/user.repository';
import { CustomTypeOrmModule } from '@src/common/database/custom-typeorm.module';

@Module({
  imports: [CustomTypeOrmModule.forCustomRepository([UserRepository])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
