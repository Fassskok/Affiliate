<script setup>
import { inject, ref, onMounted } from 'vue'
import Msg from './Msg.vue'

const app = inject('app')
const parent = app

const active = ref(0)
const menu = ref(0)
const user = ref({})

onMounted(() => {
  user.value = parent.state.user || {}
})

function toggleActive() {
  active.value = active.value === 1 ? 0 : 1
}

function toggleMenu() {
  menu.value = menu.value === 1 ? 0 : 1
}
</script>

<template>
  <header class="header">
    <div class="wrapper">
      <div class="flex">

        <div class="w20 logo">
          <img :src="parent.state.url + '/app/views/images/logo.svg'" />
        </div>

        <div class="w70">
          <div id="menu">
            <i class="fas fa-bars" @click="menu = 1"></i>

            <ul :class="{ active: menu == 1 }" v-if="user.type === 'admin'">
              <li v-if="menu == 1" class="al"><i class="fas fa-times" @click="menu = 0"></i></li>
              <li>
                <router-link :class="{ 'router-link-active': $route.path.includes('campaign') }" to="/campaigns">
                  <i class="fas fa-bullhorn"></i> Campaigns
                </router-link>
              </li>
              <li>
                <router-link :class="{ 'router-link-active': $route.path.includes('user') }" to="/users">
                  <i class="fas fa-users"></i> Users
                </router-link>
              </li>
            </ul>

            <ul :class="{ active: menu == 1 }" v-else>
              <li v-if="menu == 1" class="al"><i class="fas fa-times" @click="menu = 0"></i></li>
              <li><router-link to="/statistics"><i class="fas fa-chart-area"></i> Statistics</router-link></li>
              <li><router-link to="/ads"><i class="fas fa-image"></i> Ads</router-link></li>
              <li><router-link to="/sites"><i class="fab fa-chrome"></i> Sites</router-link></li>
              <li><router-link to="/payments"><i class="fas fa-credit-card"></i> Payments</router-link></li>
            </ul>
          </div>
        </div>

        <div class="w10 al" id="user-top" v-if="user.user">
          <div id="user-circle" @click="toggleActive()">{{ user.user[0] }}</div>
          <i class="fas fa-caret-down" @click="toggleActive()"></i>

          <div id="user-info" :class="{ active: active == 1 }">
            <a href="#" @click.prevent="parent.logout()">
              <i class="fas fa-sign-out-alt"></i> {{ user.user }} Log out
            </a>
          </div>
        </div>

      </div>
    </div>

    <Msg ref="msg" />
  </header>
</template>
