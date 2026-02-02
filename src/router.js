import { createRouter, createWebHashHistory } from 'vue-router';
import Login from './components/Login.vue';
import Campaigns from './components/Campaigns.vue';
import Campaign from './components/Campaign.vue';
import Users from './components/Users.vue';
import User from './components/user.vue';

const routes = [
  { path: '/', name: 'Sign in', component: Login },
  { path: '/campaigns', name: 'Campaigns', component: Campaigns },
  { path: '/campaign/:id', name: 'Campaign', component: Campaign},

  { path: '/users', name: 'Users', component: Users },
  { path: '/user/:id', name: 'User', component: User },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});
