import { notify } from '@kyvg/vue3-notification'
import { type NavigationGuardNext, type RouteLocationRaw } from 'vue-router'

/**
 * Redirect to home if user is not authenticated
 */
export function isAuthenticatedGuard(
  to: RouteLocationRaw,
  from: RouteLocationRaw,
  next: NavigationGuardNext
): void {
  const user = localStorage.getItem('user')
  if (user && JSON.parse(user)) {
    next()
  } else {
    notify({
      type: 'error',
      text: 'You must be authenticated to access this page'
    })
    next('/')
  }
}
