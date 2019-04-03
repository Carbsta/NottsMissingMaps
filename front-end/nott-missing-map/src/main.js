import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader
import AsyncComputed from 'vue-async-computed'

Vue.use(Vuetify, { options: { customProperties: true } })
Vue.use(AsyncComputed)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
