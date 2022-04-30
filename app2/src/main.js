import Vue from 'vue'
import App from './App.vue'
// import './registerServiceWorker'
import router from './router'
import store from './store'

// import vuetify from '@/plugins/vuetify'
import ElementUI from 'element-ui'

Vue.use(ElementUI, { size: 'medium', zIndex: 3000 })
// Vue.use(vuetify)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
