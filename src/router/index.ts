// Composables
import { useUserStore } from '@/store/user';
import { RouteLocationNormalized, createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/signin',
    name: 'auth',
    redirect: { name: 'signin' },
    component: () => import('@/layouts/Auth.vue'),
    children: [
      {
        path: '',
        name: 'signin',
        component: () => import('@/views/auth/signIn.vue'),
      },
      {
        path: '/signup',
        name: 'signup',
        component: () => import('@/views/auth/signUp.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/Default.vue'),
    meta: { needAuth: true },
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/home.vue'),
        meta: {
          nav: {
            key: 'home',
            icon: 'mdi-home',
          },
        },
      },
      {
        path: 'clients',
        name: 'clients',
        component: () => import('@/views/clients/index.vue'),
        meta: {
          nav: {
            key: 'clients',
            icon: 'mdi-account-multiple',
          },
        },
        children: [
          {
            path: ':id',
            name: 'client',
            component: () => import('@/views/clients/detail.vue'),
          },
        ],
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/views/projects/index.vue'),
        meta: {
          nav: {
            key: 'projects',
            icon: 'mdi-apps',
          },
        },
        children: [
          {
            path: ':id',
            name: 'project',
            component: () => import('@/views/projects/detail.vue'),
          },
        ],
      },
      {
        path: 'tasks',
        name: 'tasks',
        component: () => import('@/views/tasks/index.vue'),
        meta: {
          nav: {
            key: 'tasks',
            icon: 'mdi-view-week',
          },
        },
        children: [
          {
            path: ':id',
            name: 'task',
            component: () => import('@/views/tasks/detail.vue'),
          },
        ],
      },
      {
        path: 'tracking',
        name: 'tracking',
        redirect: { name: 'trackingCalendar' },
        meta: {
          nav: {
            key: 'tracking',
            icon: 'mdi-calendar',
          },
        },
        children: [
          {
            path: 'calendar',
            name: 'trackingCalendar',
            component: () => import('@/views/tracking/calendar.vue'),
            meta: {
              tab: {
                key: 'trackingCalendar',
                icon: 'mdi-calendar',
              },
            },
          },
          {
            path: 'table',
            name: 'trackingTable',
            component: () => import('@/views/tracking/table.vue'),
            meta: {
              tab: {
                key: 'trackingTable',
                icon: 'mdi-table',
              },
            },
          },
        ],
      },
      {
        path: 'finance',
        name: 'finance',
        redirect: { name: 'financeDashboard' },
        meta: {
          nav: {
            key: 'finance',
            icon: 'mdi-cash-multiple',
          },
        },
        children: [{
          path: '',
          name: 'financeDashboard',
          component: () => import('@/views/finance/index.vue'),
          meta: {
            tab: {
              key: 'financeDashboard',
              icon: 'mdi-cash-multiple',
            },
          },
        },{
          path: 'transactions',
          name: 'financeTransactions',
          component: () => import('@/views/finance/transactions.vue'),
          meta: {
            tab: {
              key: 'financeTransactions',
              icon: 'mdi-table',
            },
          },
        }],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach(async (to: RouteLocationNormalized) => {
  if (!to.meta?.needAuth || to.name === 'auth') return true;
  const userStore = useUserStore();
  await userStore.init();
  if (userStore.isAuthorized) return true;
  else return { name: 'auth' };
})

export default router
