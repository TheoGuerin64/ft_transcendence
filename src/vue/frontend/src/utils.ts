/**
 * Sleep for a given amount of time
 * @param milliseconds time to sleep in milliseconds
 * @returns promise that resolves after given time
 */
export async function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

/**
 * Get cookie value
 * @param name cookie name
 * @returns cookie value
 */
export function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length == 2) return parts.pop()!.split(';').shift()
}
