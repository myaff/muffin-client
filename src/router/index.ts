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
        component: () => import('@/views/SignIn.vue'),
      },
      {
        path: '/signup',
        name: 'signup',
        component: () => import('@/views/SignUp.vue'),
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
        component: () => import('@/views/Home.vue'),
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
        component: () => import('@/views/Clients.vue'),
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
            component: () => import('@/views/ClientDetail.vue'),
          },
        ],
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/views/Projects.vue'),
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
            component: () => import('@/views/ProjectDetail.vue'),
          },
        ],
      },
      {
        path: 'tasks',
        name: 'tasks',
        component: () => import('@/views/Tasks.vue'),
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
            component: () => import('@/views/TaskDetail.vue'),
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
            component: () => import('@/views/TrackingCalendar.vue'),
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
            component: () => import('@/views/TrackingTable.vue'),
            meta: {
              tab: {
                key: 'trackingTable',
                icon: 'mdi-table',
              },
            },
          },
        ],
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
