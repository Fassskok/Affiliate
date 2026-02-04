<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})

const active = ref(0)

defineExpose({ active })
</script>

<template>
  <template v-if="active === 1">
    <!-- затемнение -->
    <div class="popup-back"></div>

    <!-- popup -->
    <div
      class="popup"
      :class="{ fullscreen }"
    >
      <!-- header -->
      <div class="head-popup">
        <div class="head-title">
          {{ title }}
        </div>

        <a href="#" @click.prevent="active = 0">
          <i class="fas fa-window-close"></i>
        </a>
      </div>

      <!-- content -->
      <div class="popup-inner">
        <slot />
      </div>
    </div>
  </template>
</template>