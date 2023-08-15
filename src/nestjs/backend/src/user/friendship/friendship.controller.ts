import { JwtAuthGuard } from '../../auth/auth-jwt.guard';
import { LoginDto } from './friendship.pipe';
import { FriendshipService } from './friendship.service';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

@Controller('user/friends')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  /**
   * Get user friends
   * @returns List of friends
   */
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  async getFriends(@Req() req: any): Promise<any> {
    return await this.friendshipService.findFriends(req.user.login);
  }

  /**
   * Add a friend
   * @param login login of the friend
   */
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('')
  async postFriends(
    @Req() req: any,
    @Body() loginDto: LoginDto,
  ): Promise<void> {
    try {
      await this.friendshipService.addFriendshipRequest(
        req.user.login,
        loginDto.login,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Accept a friend request
   * @param login login of the friend
   */
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('accept')
  async postAccept(@Req() req: any, @Body() loginDto: LoginDto): Promise<void> {
    try {
      await this.friendshipService.acceptFriendshipRequest(
        req.user.login,
        loginDto.login,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Remove a friend
   * @param login login of the friend
   */
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('remove')
  async postRemove(@Req() req: any, @Body() loginDto: LoginDto): Promise<void> {
    try {
      await this.friendshipService.deleteFriendship(
        req.user.login,
        loginDto.login,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /**
   * Is the user a friend
   * @param login login of the friend
   * @returns true if the user is a friend
   */
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('isFriend')
  async postIsFriend(
    @Req() req: any,
    @Body() loginDto: LoginDto,
  ): Promise<boolean> {
    return await this.friendshipService.isFriends(
      req.user.login,
      loginDto.login,
    );
  }
}
