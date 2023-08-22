import { Channel } from './channel.entity';
import { ChannelService } from './channel.service';
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard';
import { Message } from './message.entity';
import { PasswordDto } from './channel.pipe';
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
  constructor(private readonly channelService: ChannelService) {}
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

  // @UseGuards(JwtAuthGuard)
  // @Post('password/add')
  // async addPassword(
  //   @Body() passwordDto: PasswordDto,
  //   @Req() req: any,
  // ): Promise<boolean> {
  //   return await this.channelService.addPassword(
  //     passwordDto.name,
  //     passwordDto.password,
  //     req.user.login,
  //   );
  // }
}
