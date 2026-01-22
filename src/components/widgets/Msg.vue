<script setup>
import { ref, nextTick } from 'vue'

const alert = ref('')
const success = ref('')
let t1 = null
let t2 = null

function fadeIn(el, timeout, display = 'flex') {
  if (!el) return
  el.style.display = display
  setTimeout(() => el.classList.add('show'), 10)
}

function fadeOut(el, timeout) {
  if (!el) return
  el.classList.remove('show')
  setTimeout(() => el.style.display = 'none', timeout)
}

async function successFun(msg) {
  success.value = msg
  await nextTick()

  const block = document.querySelector('.successMsg')
  if (!block) return

  clearTimeout(t1)
  clearTimeout(t2)

  fadeIn(block, 300, 'flex')
  t2 = setTimeout(() => fadeOut(block, 300), 3000)
}

async function alertFun(msg) {
  alert.value = msg
  await nextTick()

  const block = document.querySelector('.alertMsg')
  if (!block) return

  clearTimeout(t1)
  clearTimeout(t2)

  fadeIn(block, 300, 'flex')
  t2 = setTimeout(() => fadeOut(block, 300), 3000)
}

defineExpose({ successFun, alertFun })
</script>

<template>
  <div>
    <div class="alertMsg" v-if="alert">
      <div class="wrapper al">
        <i class="fas fa-times-circle"></i> {{ alert }}
      </div>
    </div>

    <div class="successMsg" v-if="success">
      <div class="wrapper al">
        <i class="fas fa-check-circle"></i> {{ success }}
      </div>
    </div>
  </div>
</template>
