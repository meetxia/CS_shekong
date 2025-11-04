import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/activation',
    name: 'Activation',
    component: () => import('../views/ActivationPage.vue'),
    meta: { title: '激活测评' }
  },
  {
    path: '/assessment',
    name: 'Assessment',
    component: () => import('../views/AssessmentPage.vue'),
    meta: { title: '社恐测评' },
    beforeEnter: (to, from, next) => {
      const isActivated = localStorage.getItem('test_activated')
      if (!isActivated) {
        next('/activation')
      } else {
        next()
      }
    }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('../views/ReportPage.vue'),
    meta: { title: '测评报告' },
    beforeEnter: (to, from, next) => {
      const hasReport = localStorage.getItem('test_report')
      if (!hasReport) {
        next('/assessment')
      } else {
        next()
      }
    }
  },
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { title: '激活码后台' },
    children: [
      { path: '', redirect: { name: 'AdminDashboard' } },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboard.vue'),
        meta: { title: '数据总览' }
      },
      {
        path: 'codes',
        name: 'AdminCodes',
        component: () => import('../views/admin/AdminCodes.vue'),
        meta: { title: '激活码管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 社恐程度专业测评` : '社恐程度专业测评'
  next()
})

export default router

