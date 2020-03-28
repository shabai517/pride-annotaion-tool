import Vue from 'vue'
import Router from 'vue-router'

const Index = () => import('./views/Index.vue')
const Check = () => import('./views/Check.vue')
const Sample = () => import('./views/Sample.vue')
const Annotate = () => import('./views/Annotate.vue')
const Srdf = () => import('./views/Srdf.vue')

Vue.use(Router)
export default new Router({
  mode: 'history',
  routes: [
    {
      path:'/',
      name: 'index',
      component: Index,
    },
    {
      path:'/check',
      name: 'check',
      component: Check,
    },
    {
      path:'/sample/:id',
      name: 'sample',
      component: Sample,
    },
    {
      path:'/annotate/:id',
      name: 'annotate',
      component: Annotate,
    },
    {
      path:'/srdf',
      name: 'srdf',
      component: Srdf,
    },
  ],
})
