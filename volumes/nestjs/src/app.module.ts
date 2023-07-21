import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.gateway';
import { AuthService } from './services/auth.service';
import { User } from './entities/user.entity';
import { UserService } from './services/user.service';
import { Intra42Service } from './services/intra42.service';
import { UserInputController } from './userInput.controller';
import { UserInputService } from './userInput.services';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_USER,
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    HttpModule,
  ],
  controllers: [UserInputController],
  providers: [UserInputService, UserService, Intra42Service, AuthService, AppService],
})
export class AppModule {}
