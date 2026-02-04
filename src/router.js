import { createRouter, createWebHashHistory } from 'vue-router';

import Login from './components/Login.vue';
import Campaigns from './components/Campaigns.vue';
import Campaign from './components/Campaign.vue';
import Users from './components/Users.vue';
import User from './components/user.vue';

import Statistics from './components/Statistics.vue';
import Ads from './components/Ads.vue';
import Sites from './components/Sites.vue';
import Payments from './components/Payments.vue';

const routes = [
  { path: '/', name: 'Sign in', component: Login },

  { path: '/campaigns', name: 'Campaigns', component: Campaigns },
  { path: '/campaign/:id', name: 'Campaign', component: Campaign },

  { path: '/users', name: 'Users', component: Users },
  { path: '/user/:id', name: 'User', component: User },

  { path: '/statistics', name: 'Statistics', component: Statistics },
  { path: '/ads', name: 'Ads', component: Ads },
  { path: '/sites', name: 'Sites', component: Sites },
  { path: '/payments', name: 'Payments', component: Payments },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});
