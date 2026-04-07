import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { VueShowdownPlugin } from 'vue-showdown';
import App from "./App.vue";
import "./styles/tailwind.css";
import HomePage from "./pages/HomePage.vue";
import DetectPage from "./pages/DetectPage.vue";
import LoginPage from "./pages/LoginPage.vue";
import DetailPage from "./pages/DetailPage.vue";
import RecommendationDetailPage from "./pages/RecommendationDetailPage.vue";
import MePage from "./pages/MePage.vue";
import TimelinePage from "./pages/TimelinePage.vue";
import { createPinia } from "pinia";
import { isAuthenticatedSession } from "./api";
import VueViewer from "v-viewer";
import 'viewerjs/dist/viewer.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/home" },
    { path: "/home", component: HomePage, meta: { requiresAuth: true } },
    { path: "/detect", component: DetectPage },
    { path: "/login", component: LoginPage },
    { path: "/recommendation-detail", component: RecommendationDetailPage },
    { path: "/me", component: MePage, meta: { requiresAuth: true } },
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

createApp(App)
    .use(router)
    .use(createPinia())
    .use(VueViewer)
    .use(VueShowdownPlugin)
    .mount("#app");
