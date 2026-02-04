<script setup>
import { inject, reactive, ref, onMounted, getCurrentInstance } from 'vue'
import Header from './widgets/Header.vue'
import Popup from './widgets/Popup.vue'

const app = inject('app')
const { proxy } = getCurrentInstance()
const parent = app

const header = ref(null)
const paymentPopup = ref(null)

const dataState = reactive({
  parent: "",
  data: {},
  loader: 1
})

// ==================== функции ====================

// Получение платежей
const get = () => {
  const data = parent.toFormData(parent.state.formData)
  data.append('id', parent.state.user.id)

  dataState.loader = 1

  proxy.$axios.post(`${parent.state.url}/site/getPayments?auth=${parent.state.user.auth}`, data)
    .then(res => {
      dataState.loader = 0
      dataState.data = res.data
    })
    .catch(err => {
      console.log(err)
      parent.logout?.()
    })
}

// Открытие popup для платежа
const openPayment = (item) => {
  parent.state.formData = { ...item }
  if (paymentPopup.value) paymentPopup.value.active = 1
}

// ==================== инициализация ====================
onMounted(() => {
  dataState.parent = parent
  if (!parent.state.user) parent.logout?.()
  else get()
})
</script>

<template>
  <div class="inside-content payments">
    <Header ref="header" />

    <div id="spinner" v-if="dataState.loader"></div>

    <div class="wrapper">
      <div class="flex panel">
        <div class="w20 ptb15 al"></div>
        <div class="w50"></div>
        <div class="w30 ptb10">
          <h2>Payments</h2>
        </div>
      </div>

      <!-- Popup платежа -->
      <Popup ref="paymentPopup" title="Payment details">
        <div class="form inner-form">
          <form v-if="parent.state.formData">
            <div class="row">
              <label>Value</label>
              <input type="text" v-model="parent.state.formData.Value" readonly />
            </div>
            <div class="row">
              <label>Date</label>
              <input type="text" v-model="parent.state.formData.date_title" readonly />
            </div>
            <div class="row">
              <label>Description</label>
              <textarea v-model="parent.state.formData.description" readonly></textarea>
            </div>
          </form>
        </div>
      </Popup>

      <!-- Таблица платежей -->
      <div class="table" v-if="dataState.data.items && dataState.data.items.length">
        <table>
          <thead>
            <tr>
              <th class="id">#</th>
              <th class="id">Value</th>
              <th>Date</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dataState.data.items" :key="item.id">
              <td class="id">{{ item.id }}</td>
              <td class="id">
                <a href="#" @click.prevent="openPayment(item)">
                  {{ item.Value }}
                </a>
              </td>
              <td>
                <a href="#" @click.prevent="openPayment(item)">
                  {{ item.date_title }}
                </a>
              </td>
              <td>{{ item.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty" v-if="!dataState.data.items || !dataState.data.items.length">
        No items
      </div>
    </div>
  </div>
</template>
