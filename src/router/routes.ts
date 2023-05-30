import { type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      {
        name: 'home',
        path: '',
        alias: 'projects',
        component: () => import('pages/project/ProjectList.vue'),
      },
      {
        name: 'projects',
        path: '/projects',
        component: () => import('pages/project/ProjectList.vue'),
      },
      {
        name: 'project-translator',
        path: '/project/translator/:id',
        component: () => import('pages/project/TextEditor.vue'),
      },
      {
        name: 'project-translator-lang',
        path: '/project/translator/:id/:lang',
        component: () => import('pages/project/TextOfLanguage.vue'),
        props: true,
      },
      {
        name: 'project-details',
        path: '/project/details/:id',
        component: () => import('pages/project/LanguageList.vue'),
      },
      {
        name: 'project-creator',
        path: '/project/creator',
        component: () => import('pages/project/ProjectProps.vue'),
      },
      {
        name: 'project-editor',
        path: '/project/editor/:id',
        component: () => import('pages/project/ProjectProps.vue'),
      },
      {
        name: 'settings',
        path: '/settings/:section?',
        component: () => import('pages/SettingsPage.vue'),
      },

      {
        name: 'demos/flags',
        path: '/demos/flags',
        component: () => import('pages/demos/FlagList.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
