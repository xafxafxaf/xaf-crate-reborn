import { createApp } from 'vue'

import router from './router'
import store from './vuex'

import IconWrapper from '~/components/icon-wrapper.vue'

import App from './App.vue'

import InitializeViews from '~/views'
InitializeViews(router, store)

const app = createApp(App)
app.component('icon-wrapper', IconWrapper)
app.use(router).use(store)

router.isReady().then(() => app.mount('#app'))
