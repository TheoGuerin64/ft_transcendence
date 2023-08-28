import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard';
import { Invitation } from './invitation.entity';
import { InvitationService } from './invitation.service';
import {
  AcceptInvitationDto,
  RefuseInvitationDto,
  SendInvitationDto,
} from './invitation.pipe';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getInvitations(@Req() req: any): Promise<Invitation[]> {
    return await this.invitationService.getInvitations(req.user.login);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async sendInvitation(
    @Req() req: any,
    @Body() sendInvitationDto: SendInvitationDto,
  ): Promise<void> {
    await this.invitationService.sendInvitation({
      requester_login: req.user.login,
      requested_login: sendInvitationDto.login,
      requested_socket_id: sendInvitationDto.socket_id,
      channel: sendInvitationDto.channel,
    });
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(
    @Req() req: any,
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ): Promise<void> {
    const invitation = await this.invitationService.findInvitationById(
      acceptInvitationDto.id,
    );
    if (invitation.requester.login !== req.user.login) {
      throw new BadRequestException('You are not the requester');
    }

    await this.invitationService.acceptInvitation(
      invitation,
      acceptInvitationDto.socket_id,
    );
  }

  @Post('refuse')
  @UseGuards(JwtAuthGuard)
  async refuseInvitation(
    @Req() req: any,
    @Body() refuseInvitationDto: RefuseInvitationDto,
  ): Promise<void> {
    const invitation = await this.invitationService.findInvitationById(
      refuseInvitationDto.id,
    );
    if (invitation.requester.login !== req.user.login) {
      throw new BadRequestException('You are not the requester');
    }

    await this.invitationService.refuseInvitation(invitation);
  }
}
