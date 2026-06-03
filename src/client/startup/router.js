/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { createRouter, createWebHistory } from 'vue-router';

import PageLogin from '/src/client/pages/Login.vue';
import PageLoggedOut from '/src/client/pages/LoggedOut.vue';
import PageSignup from '/src/client/pages/Signup.vue';
import PageVerifEmailLink from '/src/client/pages/VerifEmailLink.vue';
import PageForgotPsw from '/src/client/pages/ForgotPsw.vue';
import PageResetPswLink from '/src/client/pages/ResetPswLink.vue';
import PageEnterDemo from '/src/client/pages/EnterDemo.vue';

import PageHome from '/src/client/pages/Home.vue';
import PageTimeTracker from '/src/client/pages/TimeTracker.vue';
import PageRecent from '/src/client/pages/Recent.vue';
import PageTeamMonitor from '/src/client/pages/TeamMonitor.vue';
import PageUserMonitor from '/src/client/pages/UserMonitor.vue';
import PageCatalog from '/src/client/pages/Catalog.vue';
import PageAssets from '/src/client/pages/Assets.vue';
import PageClientAdd from '/src/client/pages/ClientAdd.vue';
import PageProjectAdd from '/src/client/pages/ProjectAdd.vue';
import PageClientView from '/src/client/pages/ClientView.vue';
import PageProjectView from '/src/client/pages/ProjectView.vue';
import PageClientEdit from '/src/client/pages/ClientEdit.vue';
import PageProjectEdit from '/src/client/pages/ProjectEdit.vue';
import PageComposer from '/src/client/pages/Composer.vue';
import PageInOut from '/src/client/pages/InOut.vue';
import PageAccount from '/src/client/pages/Account.vue';
import PageAbout from '/src/client/pages/About.vue';
import PageInstall from '/src/client/pages/Install.vue';

import PageAdminUsers from '/src/client/pages/AdminUsers.vue';
import PageAdminUserAdd from '/src/client/pages/AdminUserAdd.vue';
import PageAdminUserEdit from '/src/client/pages/AdminUserEdit.vue';
import PageAdminMainSettings from '/src/client/pages/AdminMainSettings.vue';
import PageAdminTaskGroups from '/src/client/pages/AdminTaskGroups.vue';
import PageAdminTeams from '/src/client/pages/AdminTeams.vue';
import PageAdminExporters from '/src/client/pages/AdminExporters.vue';
import PageAdminInOutOptions from '/src/client/pages/AdminInOutOptions.vue';
import PageAdminTaskGroupEdit from '/src/client/pages/AdminTaskGroupEdit.vue';
import PageAdminSubscriptions from '/src/client/pages/AdminSubscriptions.vue';
import PageAdminTerminate from '/src/client/pages/AdminTerminate.vue';

import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';

const routes = [
  // external
  {
    path: '/login',
    component: PageLogin,
    meta: { external: true, topMenuExternal: true, bottomMenuExternal: true },
  },
  {
    path: '/bye',
    component: PageLoggedOut,
    meta: { external: true, topMenuExternal: true },
  },
  {
    path: '/logout',
    component: PageHome,
    beforeEnter: (to, from, next) => {
      Meteor.logout();
      next('/bye');
    },
  },
  {
    path: '/signup',
    component: PageSignup,
    meta: { external: true, topMenuExternal: true },
  },
  {
    path: '/verify-email/:token',
    component: PageVerifEmailLink,
    meta: { external: true, noTopMenu: true },
  },
  {
    path: '/forgot-password',
    component: PageForgotPsw,
    meta: { external: true, topMenuExternal: true },
  },
  {
    path: '/reset-password/:token',
    component: PageResetPswLink,
    meta: { external: true, topMenuExternal: true },
  },
  {
    path: '/start-demo',
    component: PageEnterDemo,
    meta: { external: true, topMenuExternal: true },
    beforeEnter: (to, from, next) => {
      if (!Meteor.settings.public.demoMode) next('/');
      next();
    },
  },
  // /external

  // internal
  {
    path: '/',
    redirect: '/overview',
  },
  {
    path: '/overview',
    component: PageHome,
    meta: { title: 'Overview' },
  },
  {
    path: '/day',
    component: PageTimeTracker,
    beforeEnter: (to, from, next) => {
      const trackerDate = dayjs().format('YYYY-MM-DD');
      next({ name: 'timeTracker', params: { trackerDate } });
    },
  },
  {
    path: '/day/:trackerDate',
    name: 'timeTracker',
    component: PageTimeTracker,
    meta: {
      requirePermission: 'timeTracker',
      noPadding: true,
      secondTopMenu: 3,
      title: 'Tracker',
    },
  },
  {
    path: '/recent',
    component: PageRecent,
    meta: {
      requirePermission: 'timeTracker',
      secondTopMenu: 3,
      title: 'Recent',
    },
  },
  {
    path: '/teammonitor',
    component: PageTeamMonitor,
    beforeEnter: (to, from, next) => {
      const monitorDate = dayjs().format('YYYY-MM-DD');
      next({ name: 'teamMonitor', params: { monitorDate } });
    },
  },
  {
    path: '/teammonitor/:monitorDate',
    name: 'teamMonitor',
    component: PageTeamMonitor,
    meta: {
      requirePermission: 'monitor',
      noPadding: true,
      secondTopMenu: 3,
      title: 'Team Monitor',
    },
  },
  {
    path: '/usermonitor',
    component: PageUserMonitor,
    beforeEnter: (to, from, next) => {
      const monitorDate = dayjs().format('YYYY-MM-DD');
      next({ name: 'userMonitor', params: { monitorDate } });
    },
  },
  {
    path: '/usermonitor/:monitorDate',
    name: 'userMonitor',
    component: PageUserMonitor,
    meta: {
      noPadding: true,
      secondTopMenu: 3,
      title: 'User Monitor',
    },
  },
  {
    path: '/catalog',
    component: PageCatalog,
    meta: {
      requirePermission: 'catalog',
      secondTopMenu: 3,
      title: 'Clients & Projects',
    },
  },
  {
    path: '/assets',
    component: PageAssets,
    meta: { title: 'Assets' },
  },
  {
    path: '/clients/add',
    component: PageClientAdd,
    meta: {
      requirePermission: 'clientsEdit',
      title: 'Add Client',
    },
  },
  {
    path: '/projects/add',
    component: PageProjectAdd,
    meta: {
      requirePermission: 'projectsEdit',
      title: 'Add Project',
    },
  },
  {
    path: '/clients/view/:clientId',
    name: 'clientView',
    component: PageClientView,
    meta: { title: 'View Client' },
  },
  {
    path: '/projects/view/:projectId',
    name: 'projectView',
    component: PageProjectView,
    meta: { title: 'View Project' },
  },
  {
    path: '/clients/edit/:clientId',
    name: 'clientEdit',
    component: PageClientEdit,
    meta: {
      requirePermission: 'clientsEdit',
      title: 'Edit Client',
    },
  },
  {
    path: '/projects/edit/:projectId',
    name: 'projectEdit',
    component: PageProjectEdit,
    meta: {
      requirePermission: 'projectsEdit',
      title: 'Edit Project',
    },
  },
  {
    path: '/explorer',
    name: 'composer',
    component: PageComposer,
    meta: {
      requirePermission: 'composer',
      title: 'Timesheet Explorer',
    },
  },
  {
    path: '/inout',
    component: PageInOut,
    meta: {
      requirePermission: 'inOutView',
      title: 'In/Out',
    },
  },
  {
    path: '/settings',
    component: PageAccount,
    meta: { title: 'Settings' },
  },
  {
    path: '/about',
    component: PageAbout,
    meta: { title: 'About' },
  },
  {
    path: '/install',
    component: PageInstall,
    meta: { title: 'Install' },
  },
  // /internal

  // admin
  {
    path: '/admin/users/list',
    component: PageAdminUsers,
    meta: {
      requirePermission: 'admin',
      title: 'Users',
    },
  },
  {
    path: '/admin/users/add',
    component: PageAdminUserAdd,
    meta: { requirePermission: 'admin', title: 'Add User' },
  },
  {
    path: '/admin/users/edit/:userId',
    name: 'userEdit',
    component: PageAdminUserEdit,
    meta: { requirePermission: 'admin', title: 'Edit User' },
  },
  {
    path: '/admin/settings',
    component: PageAdminMainSettings,
    meta: { requirePermission: 'admin', title: 'Main Settings' },
  },
  {
    path: '/admin/taskgroups',
    component: PageAdminTaskGroups,
    meta: {
      requirePermission: 'admin',
      title: 'Task Groups',
    },
  },
  {
    path: '/admin/taskgroups/edit/:taskGroupId',
    name: 'taskGroupEdit',
    component: PageAdminTaskGroupEdit,
    meta: {
      requirePermission: 'admin',
      title: 'Edit Task Group',
    },
  },
  {
    path: '/admin/teams',
    component: PageAdminTeams,
    meta: {
      requirePermission: 'admin',
      title: 'Teams',
    },
  },
  {
    path: '/admin/exporters',
    component: PageAdminExporters,
    meta: {
      requirePermission: 'admin',
      title: 'Exporters',
    },
  },
  {
    path: '/admin/inoutoptions',
    component: PageAdminInOutOptions,
    meta: {
      requirePermission: 'admin',
      title: 'In/Out Options',
    },
  },
  {
    path: '/admin/subscriptions',
    component: PageAdminSubscriptions,
    meta: {
      requirePermission: 'admin',
      title: 'Subscriptions',
    },
  },
  {
    path: '/admin/termination',
    component: PageAdminTerminate,
    meta: {
      requirePermission: 'admin',
      title: 'Terminate Organization',
    },
  },
  // /admin
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (!to.meta.external && !Meteor.userId()) {
    next('/login');
  } else {
    next();
  }
});

router.beforeEach((to, from, next) => {
  if (to.meta.title && Meteor.userId()) {
    document.title = `Tuumik - ${to.meta.title}`;
  } else {
    document.title = 'Tuumik';
  }
  next();
});
