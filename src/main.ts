import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import "./styles/tailwind.css";
import HomePage from "./pages/HomePage.vue";
import LoginPage from "./pages/LoginPage.vue";
import DetailPage from "./pages/DetailPage.vue";
import RecommendationDetailPage from "./pages/RecommendationDetailPage.vue";
import MePage from "./pages/MePage.vue";
import TimelinePage from "./pages/TimelinePage.vue";

const AUTH_STORAGE_KEY = "manage-system-authenticated";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/home" },
    { path: "/home", component: HomePage, meta: { requiresAuth: true } },
    { path: "/login", component: LoginPage },
    { path: "/detail", component: DetailPage, meta: { requiresAuth: true } },
    { path: "/recommendation-detail", component: RecommendationDetailPage },
    { path: "/me", component: MePage, meta: { requiresAuth: true } },
    {
      path: "/timeline",
      component: TimelinePage,
      meta: { requiresAuth: true },
    },
  ],
});

// route guard to check authentication before each route change

router.beforeEach((to) => {
  const isAuthenticated = localStorage.getItem(AUTH_STORAGE_KEY) === "true";

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

createApp(App).use(router).mount("#app");
