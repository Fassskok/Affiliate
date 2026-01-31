<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: [String, Boolean, Number]
})

const emit = defineEmits(['update:modelValue'])

const value = ref(false)

watch(() => props.modelValue, (newVal) => {
  value.value = newVal
})

onMounted(() => {
  value.value = props.modelValue
})

function change() {
  emit('update:modelValue', value.value)
}
</script>

<template>
  <label class="switch">
    <input type="checkbox" v-model="value" @change="change" />
    <span class="slider round"></span>
  </label>
</template>
