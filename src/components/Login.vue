<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue'
import Msg from './widgets/Msg.vue'

const img = ref(1)
const msg = ref(null)

const { proxy } = getCurrentInstance()
const app = proxy.$root
const state = app.state

onMounted(() => {
  img.value = Math.floor(Math.random() * 7) + 1
})

const coverUrl = computed(() => {
  if (!state?.url) return ''
  return `${state.url}/app/views/images/Cover_${img.value}.jpg`
})

const logoUrl = computed(() => {
  if (!state?.url) return ''
  return `${state.url}/app/views/images/logo.svg`
})

function login() {
  const data = app.toFormData(state.formData)

  proxy.$axios.post(`${state.url}/site/login`, data)
    .then(res => {
      if (res.data.error) {
        msg.value.alertFun(res.data.error)
      }

      if (res.data.user) {
        state.user = res.data.user
        localStorage.setItem('user', JSON.stringify(res.data.user))
        app.page('/campaigns')
      }
    })
}
</script>

<template>
  <div class="flex">
    <Msg ref="msg" />

    <div id="right-area" class="w60">
      <img v-if="coverUrl" :src="coverUrl" />
    </div>

    <div id="left-area" class="w40">
    <div class="login-header">
        <div class="login-header-wrapper">
            <div class="login-title">
                <h1>Affiliate Sign in</h1>
            </div>
            <div class="login-logo">
                <img v-if="logoUrl" :src="logoUrl" />
            </div>
        </div>
    </div>

      <div class="form inner-form p20">
        <form @submit.prevent="login" v-if="state.formData">
          <div class="row">
            <label>Email</label>
            <input type="email" v-model="state.formData.email" required>
          </div>

          <div class="row">
            <label>Password</label>
            <input type="password" v-model="state.formData.password" required>
          </div>

          <div class="row">
            <button class="btn">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
