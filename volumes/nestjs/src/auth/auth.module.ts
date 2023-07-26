import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { AuthStrategy } from './auth.strategy';
import { Intra42Module } from 'src/intra42/intra42.module';

@Module({
  imports: [UserModule, HttpModule, Intra42Module],
  controllers: [AuthController],
  providers: [AuthService, AuthStrategy],
  exports: [AuthService, AuthStrategy],
})
export class AuthModule {}
