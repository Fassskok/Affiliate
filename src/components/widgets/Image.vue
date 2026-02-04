<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  modelValue: String,
  baseUrl: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const value = ref('')
const inputRef = ref(null)

onMounted(() => {
  if (props.modelValue) {
    value.value = props.baseUrl + '/' + props.modelValue
  }
})

watch(() => props.modelValue, (val) => {
  value.value = val ? props.baseUrl + '/' + val : ''
})

function change(event) {
  const file = event.target.files[0]
  const reader = new FileReader()
  reader.onload = () => {
    value.value = reader.result
  }
  reader.readAsDataURL(file)

  emit('update:modelValue', file)
}
</script>

<template>
  <div class="image-preview-area">
    <a href="#" class="select_img" @click.prevent="inputRef.click()">
      <span v-if="value">
        <img :src="value" class="im" />
      </span>
      <span v-else>
        <img :src="props.baseUrl + '/app/views/images/placeholder.png'" />
      </span>
    </a>
    <input
      type="file"
      ref="inputRef"
      accept="image/jpeg, image/png, image/gif, image/webp, image/svg+xml"
      @change="change($event)"
    />
  </div>
</template>
