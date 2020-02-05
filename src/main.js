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

Vue.use(ViewUI, { locale })
Vue.use(VueResource)
Vue.use(ReadMore)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
