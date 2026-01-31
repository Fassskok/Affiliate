<script setup>
import { ref, nextTick } from 'vue'
import Popup from './Popup.vue'

const alert = ref('')
const success = ref('')
const t1 = ref(null)
const t2 = ref(null)

const confirmTitle = ref('')
const confirmText = ref('')
const confirmCode = ref(0)
const confirmPopup = ref(null)
let interval = null

function fadeIn(el, timeout = 300, display = 'flex') {
  if (!el) return
  el.style.display = display
  el.classList.add('show')
}

function fadeOut(el, timeout = 300) {
  if (!el) return
  el.classList.remove('show')
  setTimeout(() => el.style.display = 'none', timeout)
}

async function successFun(msg) {
  success.value = msg
  await nextTick()
  const block = document.querySelector('.successMsg')
  if (!block) return
  clearTimeout(t1.value)
  clearTimeout(t2.value)
  t1.value = setTimeout(() => {
    fadeIn(block, 1000)
    t2.value = setTimeout(() => fadeOut(block, 1000), 3000)
  }, 100)
}

async function alertFun(msg) {
  alert.value = msg
  await nextTick()
  const block = document.querySelector('.alertMsg')
  if (!block) return
  block.style = ''
  clearTimeout(t1.value)
  clearTimeout(t2.value)
  t1.value = setTimeout(() => {
    fadeIn(block, 1000)
    t2.value = setTimeout(() => fadeOut(block, 1000), 3000)
  }, 100)
}

function confirmYes() { confirmCode.value = 1 }
function confirmNo() { confirmCode.value = 2 }

function confirmFun(title, text) {
  confirmTitle.value = title
  confirmText.value = text
  confirmCode.value = 0
  confirmPopup.value.active = 1

  return new Promise(resolve => {
    interval = setInterval(() => {
      if (confirmCode.value > 0) {
        clearInterval(interval)
        confirmPopup.value.active = 0
        resolve(confirmCode.value === 1)
      }
    }, 100)
  })
}

defineExpose({ successFun, alertFun, confirmFun })
</script>

<template>
  <!-- alert / success -->
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

  <!-- confirm popup -->
  <Popup ref="confirmPopup" :title="confirmTitle">
    <div class="al">
      <i class="fas fa-info-circle"></i> {{ confirmText }}
      <div class="botBtns">
        <a class="btnS" href="#" @click.prevent="confirmYes">Yes</a>
        <a class="btnS" href="#" @click.prevent="confirmNo">No</a>
      </div>
    </div>
  </Popup>
</template>
