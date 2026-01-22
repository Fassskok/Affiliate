import { createRouter, createWebHashHistory } from 'vue-router'
import Login from './components/Login.vue'
import Campaigns from './components/Campaigns.vue'

const routes = [
  { path: '/', name: 'Sign in', component: Login },
  { path: '/campaigns', name: 'Campaigns', component: Campaigns }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})