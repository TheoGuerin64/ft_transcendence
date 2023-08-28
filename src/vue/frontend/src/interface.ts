export interface User {
  login: string
  username: string
  avatar: string
}
export interface Match {
  users: User[]
  result: number[]
  id: number
}
