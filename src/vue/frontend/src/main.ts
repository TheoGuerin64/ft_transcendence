import { config } from '@fortawesome/fontawesome-svg-core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import Notifications from '@kyvg/vue3-notification'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/base.css'
import router from './router'

library.add(far, fas)
config.styleDefault = 'regular'

const app = createApp(App)

app.use(router)
app.use(Notifications)

app.mount('#app')
