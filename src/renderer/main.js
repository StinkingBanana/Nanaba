import Vue from 'vue'
import axios from 'axios'
import Buefy from 'buefy'
import autofocus from 'vue-autofocus-directive'
import 'buefy/lib/buefy.css'

import App from './App'
import router from './router'
import store from './store'

import momnet from 'moment'
import TwitchIRC from './utli/twitchIRC'
import db from './utli/dataStore'
import VTooltip from 'v-tooltip'

Vue.use(VTooltip)
Vue.use(Buefy)
Vue.directive('autofocus', autofocus)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.prototype.$twitch = TwitchIRC
Vue.db = Vue.prototype.$db = db
Vue.moment = Vue.prototype.$moment = momnet
Vue.store = Vue.prototype.$store = store

/* eslint-disable no-new */
new Vue({
  components: {
    App
  },
  router,
  store,
  template: '<App/>',
  methods: {
    getWindowSize: (e) => {
      store.commit('WIDTH', document.documentElement.clientWidth)
      store.commit('HEIGHT', document.documentElement.clientHeight)
    }
  },
  created: () => {
    TwitchIRC.on('message', (channel, userstate, message, self) => {
      // console.log(userstate, message)
      store.dispatch('USER_MSG', {type: 'meesage', userstate: userstate, message: message, self: self})
    })
    TwitchIRC.on('names', (channel, users) => {
      for (var u in users) {
        store.commit('ADD_NAME', users[u])
      }
    })
    TwitchIRC.on('cheer', (channel, userstate, message) => {
      console.log('cheer', userstate, message)
    })
    TwitchIRC.on('join', (channel, username, self) => {
      store.commit('ADD_NAME', username)
    })
    TwitchIRC.on('part', (channel, username, self) => {
      store.commit('REMOVE_NAME', username)
    })
  },
  mounted: function () {
    window.addEventListener('resize', this.getWindowSize)
    this.getWindowSize()
  }
}).$mount('#app')
