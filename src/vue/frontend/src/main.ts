import App from './App.vue'
import Notifications from '@kyvg/vue3-notification'
import router from './router'
import { config } from '@fortawesome/fontawesome-svg-core'
import { createApp } from 'vue'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import './assets/base.css'

library.add(far, fas)
config.styleDefault = 'regular'

const app = createApp(App)

app.use(router)
app.use(Notifications)

app.mount('#app')
