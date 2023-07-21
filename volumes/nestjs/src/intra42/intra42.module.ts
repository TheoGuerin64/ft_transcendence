import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { Intra42Service } from './intra42.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [Intra42Service],
  exports: [Intra42Service],
})
export class Intra42Module {}
