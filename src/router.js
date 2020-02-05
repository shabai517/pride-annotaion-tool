import Vue from 'vue'
import Router from 'vue-router'

const Login = () => import('./views/Login.vue')
const Annotation = () => import('./views/Annotation.vue')

// const Check = () => import('./views/Check.vue')
// const Sample = () => import('./views/Sample.vue')
// const Annotate = () => import('./views/Annotate.vue')

Vue.use(Router)
export default new Router({
  mode: 'history',
  routes: [
    {
      path:'/',
      name: 'login',
      component: Login,

    },
    {
      path:'/annotation',
      name: 'annotation',
      component: Annotation,
    },
    // {
    //   path:'/annotation/:id/check',
    //   name: 'check',
    //   component: Check,
    // },
    // {
    //   path:'/annotation/:id/sample',
    //   name: 'sample',
    //   component: Sample,

    // },
    // {
    //   path:'/annotation/:id/annotate',
    //   name: 'annotate',
    //   component: Annotate,
    // },
  ],
})
