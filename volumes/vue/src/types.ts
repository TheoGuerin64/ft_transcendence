export class User {
  constructor(public login: string, public name: string, public avatar: string) {}
}

export type UserResponse = {
  login: string
  name: string
  avatar: string
}
