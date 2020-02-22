import Vue from 'vue'
import Router from 'vue-router'

const Index = () => import('./views/Index.vue')
const Annotation = () => import('./views/Annotation.vue')
const Check = () => import('./views/Check.vue')
const Sample = () => import('./views/Sample.vue')
const Annotate = () => import('./views/Annotate.vue')
const CheckDataset = () => import('./views/CheckDataset.vue')

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
      path:'/checkdataset',
      name: 'checkdataset',
      component: CheckDataset,
    },
    {
      path:'/annotation',
      name: 'annotation',
      component: Annotation,
    },
    {
      path:'/annotation/:id/check',
      name: 'check',
      component: Check,
    },
    {
      path:'/annotation/:id/sample',
      name: 'sample',
      component: Sample,
    },
    {
      path:'/annotation/:id/annotate',
      name: 'annotate',
      component: Annotate,
    },
  ],
})
