import { createRouter, createWebHistory } from 'vue-router';
import welcome from './components/welcome.vue';
import Home from './components/landing.vue';
import Invontory from './components/Invontory.vue';

const routes = [
  { path: '/', redirect: '/welcome' },
  { path: '/welcome', component: welcome },
  { path: '/landing', component: Home },
  { path: '/invontory', component: Invontory },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
