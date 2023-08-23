import { Membership } from './membership.entity';
import { MembershipService } from './membership.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Membership])],
  providers: [MembershipService],
  exports: [MembershipService],
})
export class MembershipModule {}
