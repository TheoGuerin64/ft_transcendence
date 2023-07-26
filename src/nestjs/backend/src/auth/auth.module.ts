import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth-jwt.strategy';
import { Module } from '@nestjs/common';
import { OAuth2Strategy } from './auth-oauth2.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    HttpModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OAuth2Strategy, JwtStrategy],
  exports: [],
})
export class AuthModule {}
