import { Channel } from './channel.entity';
import { ChannelService } from './channel.service';
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard';
import { Membership } from './membership.entity';
import { MembershipService } from './membership.service';
import { Message } from './message.entity';
import { PasswordDto } from './channel.pipe';
import { User } from 'src/user/user.entity';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

@Controller('channel')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly membershipService: MembershipService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  async channelsCreated(): Promise<Channel[]> {
    return await this.channelService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':name')
  async channelCreated(@Param('name') name: string): Promise<Channel> {
    return await this.channelService.findOne(name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages/:name')
  async channelMessages(@Param('name') name: string): Promise<Message[]> {
    return await this.channelService.getMessageHistory(name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('owner/:name')
  async getRole(@Param('name') name: string, @Req() req: any): Promise<string> {
    const membership = await this.membershipService.findOne(
      name,
      req.user.login,
    );
    if (membership) {
      return membership.role;
    }
    return 'none';
  }

  @UseGuards(JwtAuthGuard)
  @Get('members/:name')
  async getMembers(@Param('name') name: string): Promise<User[]> {
    const memberships = await this.membershipService.findAll(name);
    const users = memberships.map((membership) => membership.user);
    return users;
  }
}
