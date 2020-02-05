import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import ViewUI from 'view-design';
import locale from 'view-design/dist/locale/en-US'
import 'view-design/dist/styles/iview.css'
import VueResource  from 'vue-resource'
import ReadMore from 'vue-read-more'
import TextHighlight from 'vue-text-highlight';

Vue.use(ViewUI, { locale })
Vue.use(VueResource)
Vue.use(ReadMore)
Vue.component('text-highlight', TextHighlight);

const bus = new Vue();
Object.defineProperty(Vue.prototype, '$bus', { get(){return this.$root.bus} });

new Vue({
  router,
  store,
  data:{bus},
  render: h => h(App)
}).$mount('#app')
