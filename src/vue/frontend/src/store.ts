import { reactive } from 'vue'

export interface User {
  name: string
  avatar: string
}

export const store = reactive({
  token: undefined as string | undefined,
  user: undefined as User | undefined,

  setUser(user: User | undefined) {
    this.user = user
  }
})
