<script setup>
import { reactive, watch, onMounted, getCurrentInstance, provide} from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { proxy } = getCurrentInstance()

const state = reactive({
  url: 'https://affiliate.yanbasok.com',
  user: { name: "", phone: "", email: "", date: "", auth: "", type: "" },
  formData: {},
  title: "",
  date: "",
  time: ""
})

watch(route, () => init())

onMounted(() => init())

function init() {
  if (localStorage.getItem('user')) {
    state.user = JSON.parse(localStorage.getItem('user'))
  }

  router.isReady().then(() => {

    if (localStorage.getItem('user')) {

      if (route.path === '/' && state.user.type === 'admin') {
        page('/campaigns')

      } else if (
        ['/campaigns', '/campaign', '/users', '/user'].includes(route.path)
        && state.user.type !== 'admin'
      ) {
        page('/statistics')

      } else if (
        ['/statistics', '/payments', '/sites'].includes(route.path)
        && state.user.type === 'admin'
      ) {
        page('/campaigns')

      } else if (
        ['/campaigns', '/campaign', '/users', '/user', '/statistics', '/payments', '/sites']
          .includes(route.path)
      ) {
        page()

      } else {
        page('/')
      }

    } else {
      page('/')
    }
  })
}

function logout() {
  state.user = { name: "", phone: "", email: "", date: "", auth: "", type: "" }
  localStorage.removeItem('user')
  page('/')
}

function page(path = '') {
  if (path) router.replace(path)
  state.title = route.name || ''
  document.title = state.title
}

function toFormData(obj) {
  const fd = new FormData()

  for (let x in obj) {
    if (typeof obj[x] === 'object' && x !== 'img' && x !== 'copy') {

      for (let y in obj[x]) {
        if (typeof obj[x][y] === 'object') {

          for (let z in obj[x][y]) {
            fd.append(`${x}[${y}][${z}]`, obj[x][y][z])
          }

        } else {
          fd.append(`${x}[${y}]`, obj[x][y])
        }
      }

    } else if (x !== 'copy') {
      fd.append(x, obj[x])
    }
  }

  return fd
}

defineExpose({
  state,
  logout,
  page,
  toFormData
})

provide('app', {
  state,
  logout,
  page,
  toFormData
})
</script>

<template>
  <router-view />
</template>
