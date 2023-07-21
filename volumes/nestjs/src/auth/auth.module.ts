import { Module } from '@nestjs/common';
import { Intra42Module } from '../intra42/intra42.module';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule, Intra42Module],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
