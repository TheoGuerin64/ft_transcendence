import { Controller, Post, Body, Headers, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserInputService } from './userInput.services';
import { FileInterceptor } from '@nestjs/platform-express';

export class SampleDto {
  name: string;
}

@Controller('')
export class UserInputController {
  constructor(private readonly UserInputService: UserInputService) {}


  @Post('uploadAvatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @Body() body: SampleDto,
    @UploadedFile() file) {
    console.log(body, file);
    return file
  }
  /*
  @Post('uploadAvatar')
  uploadAvatar(
    @Body('file') file : string,
    @Headers('login') login: string,
    @Body() body:string){
    console.log(body, file, login)
    this.UserInputService.uploadAvatar(file, login);
  }
  */
}