import { io } from 'socket.io-client'
import { reactive } from 'vue'

export type UserType = {
  login: string
  name: string
  avatar: string
  is2faEnabled: boolean
}

/**
 * Get data from local storage
 * @param key key to get data from
 * @param defaultValue default value if key is not found
 * @returns data from local storage or default value
 */
function fromLocalStorage(key: string, defaultValue: any): any {
  const data = localStorage.getItem(key)
  if (data) {
    return JSON.parse(data)
  }
  return defaultValue
}

/**
 * Global store
 */
export const useStore = reactive({
  user: fromLocalStorage('user', undefined) as UserType | null | undefined,
  isConnecting: fromLocalStorage('isConnecting', false),
  socket: io('http://localhost:3000') as any,

  /**
   * Set user
   * @param user user to set
   */
  setUser(user: UserType | null) {
    this.user = user
    localStorage.setItem('user', JSON.stringify(user))
  },

  /**
   * Update user
   * @param data partial user data to update
   */
  updateUser(data: Partial<UserType>) {
    if (!this.user) {
      throw new Error('User is not logged in')
    }
    this.setUser({ ...this.user, ...data })
  },

  /**
   * Set connecting status
   * @param isConnecting connecting status
   */
  setConnecting(isConnecting: boolean) {
    this.isConnecting = isConnecting
    localStorage.setItem('isConnecting', JSON.stringify(isConnecting))
  }
})
