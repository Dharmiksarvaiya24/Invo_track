import { createRouter, createWebHistory } from 'vue-router';
import Home from './components/landing.vue';
import Invontory from './components/Invontory.vue';

const routes = [
  { path: '/', redirect: '/landing' },
  { path: '/landing', component: Home },
  { path: '/invontory', component: Invontory },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
