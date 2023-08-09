import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { PongModule } from './pong/pong.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
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
    UserModule,
    AuthModule,
    PongModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
