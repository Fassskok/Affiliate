<script setup>
import { inject, onMounted } from 'vue'

const app = inject('app')

onMounted(() => {
  if (!app.state.user || !app.state.user.auth) {
    app.page('/')
  }
})
</script>

<template>
  <div>
    Campaigns
    <button @click="app.logout()">Logout</button>
  </div>
</template>
