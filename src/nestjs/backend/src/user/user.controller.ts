import { DeepPartial } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/auth-jwt.guard';
import { EncryptedUserDto, LoginDto, UserDto } from './user.pipe';
import { User } from './user.entity';
import { UserService } from './user.service';
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get user private informations
   * @returns User
   */
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('')
  async getUser(@Req() req: any): Promise<User> {
    return await this.userService.findOne(req.user.login);
  }

  /**
   * Get user public informations
   * @param login login of the user
   * @returns User
   */
  @UseGuards(JwtAuthGuard)
  @Post('public')
  async postPublic(
    @Req() req: any,
    @Body() loginDto: LoginDto,
  ): Promise<DeepPartial<User>> {
    const user = await this.userService.findOne(loginDto.login);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user.public;
  }

  /**
   * Update user private informations
   * @param name name of the user
   * @param avatar avatar image
   * @returns New user informations
   */
  @UseGuards(JwtAuthGuard)
  @Post('')
  @UseInterceptors(FileInterceptor('avatar'))
  async postUser(
    @Req() req: any,
    @Body() userDto: UserDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2000000,
            message: 'Avatar is too big (max 2MB)',
          }),
          new FileTypeValidator({ fileType: 'image' }),
        ],
      }),
    )
    avatar: Express.Multer.File,
  ): Promise<Partial<User>> {
    const toUpdate = {};
    if (avatar) {
      toUpdate['avatar'] =
        'data:' +
        avatar.mimetype +
        ';base64,' +
        avatar.buffer.toString('base64');
    }

    // Update only fields that are not null
    for (const key in userDto) {
      if (userDto[key]) {
        toUpdate[key] = userDto[key];
      }
    }

    // Upate user if there is something to update
    if (Object.keys(toUpdate).length > 0) {
      const user = await this.userService.findOne(req.user.login);
      Object.assign(user, toUpdate);
      await this.userService.save(user);
    }
    return toUpdate;
  }

  /**
   * Update user private informations
   * @param name name of the user
   * @param avatar avatar image
   * @returns New user informations
   */
  @Post('set')
  @UseInterceptors(FileInterceptor('avatar'))
  async postSetUser(
    @Req() req: any,
    @Body() encryptedUserDto: EncryptedUserDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2000000,
            message: 'Avatar is too big (max 2MB)',
          }),
          new FileTypeValidator({ fileType: 'image' }),
        ],
      }),
    )
    avatar: Express.Multer.File,
  ): Promise<Partial<User>> {
    const login = await this.userService.decrypt(
      encryptedUserDto.encrypted_login,
    );

    const toUpdate = {};
    if (avatar) {
      toUpdate['avatar'] =
        'data:' +
        avatar.mimetype +
        ';base64,' +
        avatar.buffer.toString('base64');
    }

    // Update only fields that are not null
    for (const key in encryptedUserDto) {
      if (encryptedUserDto[key] && key !== 'encrypted_login') {
        toUpdate[key] = encryptedUserDto[key];
      }
    }

    // Upate user if there is something to update
    if (Object.keys(toUpdate).length > 0) {
      const user = await this.userService.findOne(login);
      Object.assign(user, toUpdate);
      await this.userService.save(user);
    }
    return toUpdate;
  }

  /**
   * Get user list
   * @returns List of users
   */
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('list')
  async getList(): Promise<DeepPartial<User>[]> {
    const users = await this.userService.findAll();
    return users.map((user) => user.public);
  }

  @UseGuards(JwtAuthGuard)
  @Get('blocked')
  async getBlocked(@Req() req: any): Promise<string[]> {
    const user = await this.userService.findOne(req.user.login);
    return user.blocked;
  }
}
