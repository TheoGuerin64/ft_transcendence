export class User {
  constructor(public login: string, public name: string) {}
}

export type UserResponse = {
  login: string
  name: string
}
