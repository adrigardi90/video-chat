import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueSocketIO from 'vue-socket.io'
import VueResource from 'vue-resource';
import './styles/app.scss'
import { url } from './utils/config'

// Socket config
Vue.use(new VueSocketIO({
  debug: true,
  connection: `${url}/video-chat`,
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  },
}))
// Vue resource for http
Vue.use(VueResource)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
