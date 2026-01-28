<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  title: String,
  fullscreen: Boolean
})

const active = ref(0)
const top = ref('50%')
const left = ref('50%')
const widthVal = ref('500px')
const height = ref('auto')
const popup = ref(null)

watch(active, (n) => {
  if (n === 1 && !props.fullscreen) {
    setTimeout(() => {
      if (!popup.value) return
      let h = popup.value.clientHeight / 2
      h = Math.min(h, window.innerHeight * 0.45)
      top.value = `calc(50% - ${h}px)`
    }, 10)
  }

  if (props.fullscreen) {
    top.value = '0'
    left.value = '0'
    widthVal.value = '100%'
    height.value = '100%'
  }
})

defineExpose({ active })
</script>

<template>
  <template v-if="active === 1">
    <div class="popup-back"></div>

    <div
      class="popup"
      ref="popup"
      :style="{ top, left, transform: 'translate(-50%, -50%)', width: widthVal, height }"
    >
      <div class="flex head-popup">
        <div class="w80">
          <div class="head-title">{{ title }}</div>
        </div>
        <div class="w20 al">
          <a href="#" @click.prevent="active = 0">
            <i class="fas fa-window-close"></i>
          </a>
        </div>
      </div>

      <div class="popup-inner">
        <slot />
      </div>
    </div>
  </template>
</template>
