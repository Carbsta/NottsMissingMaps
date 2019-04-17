import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import 'vuetify/src/stylus/app.styl';
import AsyncComputed from 'vue-async-computed';
import App from './App.vue';

Vue.use(Vuetify, { options: { customProperties: true } });
Vue.use(AsyncComputed);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
