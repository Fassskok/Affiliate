<script setup>
import { inject, reactive, ref, onMounted, getCurrentInstance } from 'vue'
import Header from './widgets/Header.vue'
import Popup from './widgets/Popup.vue'
import Toogle from './widgets/toogle.vue'

const app = inject('app')
const { proxy } = getCurrentInstance()
const parent = app

const header = ref(null)
const copyPopup = ref(null)

const dataState = reactive({
  parent: "",
  data: {},
  date: "",
  date2: "",
  loader: 1
})

const GetFirstAndLastDate = () => {
  const year = new Date().getFullYear()
  const month = new Date().getMonth()
  const firstDay = new Date(year, month, 2)
  const lastDay = new Date(year, month + 1, 1)
  dataState.date = firstDay.toISOString().substring(0, 10)
  dataState.date2 = lastDay.toISOString().substring(0, 10)
}

const get = () => {
  const data = parent.toFormData(parent.state.formData)
  data.append('uid', parent.state.user.id)
  if (dataState.date) data.append('date', dataState.date)
  if (dataState.date2) data.append('date2', dataState.date2)

  dataState.loader = 1

  proxy.$axios.post(`${parent.state.url}/site/getSites?auth=${parent.state.user.auth}`, data)
    .then(res => {
      dataState.loader = 0
      dataState.data = res.data
    })
    .catch(err => {
      console.log(err)
      parent.logout?.()
    })
}

const action = (item) => {
  parent.state.formData = { ...item }
  const data = parent.toFormData(parent.state.formData)

  proxy.$axios.post(`${parent.state.url}/site/actionSite?auth=${parent.state.user.auth}`, data)
    .then(res => {
      if (parent.state.formData.id) {
        header.value.$refs.msg.successFun("Successfully updated site!")
      } else {
        header.value.$refs.msg.successFun("Successfully added new site!")
      }
      get()
    })
    .catch(err => console.log(err))
}

const copyText = async (text) => {
  if (navigator && navigator.clipboard) {
    await navigator.clipboard.writeText(text)
    header.value.$refs.msg.successFun("Successfully copied!")
    copyPopup.value.active = 0
  } else {
    header.value.$refs.msg.alertFun("Use https!")
  }
}

onMounted(() => {
  dataState.parent = parent
  if (!parent.state.user) parent.logout?.()
  else {
    get()
    GetFirstAndLastDate()
  }
})
</script>

<template>
  <div class="inside-content sites">
    <Header ref="header" />

    <div id="spinner" v-if="dataState.loader"></div>

    <div class="wrapper">
      <div class="flex panel">
        <div class="w20 ar ptb20"></div>

        <div class="date-range">
          <input type="date" v-model="dataState.date" @change="get()" />
          <span class="dash">–</span>
          <input type="date" v-model="dataState.date2" @change="get()" />
        </div>

        <div class="w20 ptb30">
          <h1>Sites</h1>
        </div>
      </div>

      <Popup ref="copyPopup" title="Copy banner">
        <div class="form inner-form">
          <form v-if="parent.state.formData">
            <div class="row">
              <label>Code</label>
              <textarea v-model="parent.state.formData.copy"></textarea>
            </div>
            <div class="row">
              <button class="btn" @click.prevent="copyText(parent.state.formData.copy)">Copy code</button>
            </div>
          </form>
        </div>
      </Popup>

      <div class="table" v-if="dataState.data.items && dataState.data.items.length">
        <table>
          <thead>
            <tr>
              <th class="id"></th>
              <th class="image">Site</th>
              <th class="id">Views</th>
              <th class="id">Clicks</th>
              <th class="id">Leads</th>
              <th class="id">Fraud clicks</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dataState.data.items" :key="item.id">
              <td class="id">
                <Toogle v-model="item.published" @update:modelValue="() => action(item)" />
              </td>
              <td class="image">{{ item.site }}</td>
              <td class="id">{{ item.views }}</td>
              <td class="id">{{ item.clicks || 0 }}</td>
              <td class="id">{{ item.leads || 0 }}</td>
              <td class="id">{{ item.fclicks || 0 }}</td>
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
