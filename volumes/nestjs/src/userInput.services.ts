import { Injectable } from '@nestjs/common';
import { UserService } from './services/user.service';

@Injectable()
export class UserInputService {

constructor(private readonly userService: UserService){}
  uploadAvatar(file: string, login: string) {
    const user = this.userService.findOne(login)
    .then( (user) => {
        const updatedUser = this.userService.update(user, {avatar: file});
        this.userService.save(updatedUser);
    });
  }
}