import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { VueShowdownPlugin } from 'vue-showdown';
import App from "./App.vue";
import "./styles/tailwind.css";
import HomePage from "./pages/HomePage.vue";
import LoginPage from "./pages/LoginPage.vue";
import DetailPage from "./pages/DetailPage.vue";
import TimelinePage from "./pages/TimelinePage.vue";
import { createPinia } from "pinia";
import { isAuthenticatedSession } from "./api";
import VueViewer from "v-viewer";
import {
  consumePendingNotificationNavigation,
  initializeReminderNotifications,
} from "./services/reminderNotifications";
import { useReminderStore } from "./stores/reminderStore";
import 'viewerjs/dist/viewer.css'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { left: 0, top: 0 };
  },
  routes: [
    { path: "/", redirect: "/home" },
    { path: "/home", component:  HomePage, meta: { requiresAuth: true } },
    { path: "/detect", component: ()=>import('./pages/DetectPage.vue') },
    { path: "/login", component: LoginPage },
    { path: "/notification-settings", component: ()=> import('./pages/NotificationSettingsPage.vue'), meta: { requiresAuth: true } },
    { path: "/task-reminders", component:()=>import('./pages/TaskReminderPage.vue'), meta: { requiresAuth: true } },
    { path: "/recommendation-detail", component: ()=>import('./pages/RecommendationDetailPage.vue') },
    { path: "/me", component: ()=>import('./pages/MePage.vue'), meta: { requiresAuth: true } },
    { path: "/about-app", component: ()=>import('./pages/AboutAppPage.vue'), meta: { requiresAuth: true } },
    {
      path: "/timeline",
      component: TimelinePage,
      meta: { requiresAuth: true },
    },
    {
      path: "/timeline/:id",
      component: DetailPage,
      meta: { requiresAuth: true },
    },
  ],
});

// route guard to check authentication before each route change

router.beforeEach((to) => {
  const isAuthenticated = isAuthenticatedSession();

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.path === "/login" && isAuthenticated) {
    return { path: "/home" };
  }

  return true;
});

router.afterEach((to, from) => {
  const toDepth = to.path.split('/').filter(Boolean).length;
  const fromDepth = from.path.split('/').filter(Boolean).length;

  if (toDepth === fromDepth) {
    to.meta.transition = "route-fade";
    return;
  }

  to.meta.transition = toDepth < fromDepth ? "route-slide-right" : "route-slide-left";
});

const pinia = createPinia();

async function bootstrap() {
  createApp(App)
      .use(router)
      .use(pinia)
      .use(VueViewer)
      .use(VueShowdownPlugin)
      .mount("#app");

  const reminderStore = useReminderStore(pinia);

  await router.isReady();
  await initializeReminderNotifications(router);
  await consumePendingNotificationNavigation(router);
  void reminderStore.syncReminderNotifications();
}

void bootstrap();
