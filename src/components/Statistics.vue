<script setup>
import { inject, reactive, ref, onMounted, getCurrentInstance } from 'vue'
import Header from './widgets/Header.vue'
import Toogle from './widgets/toogle.vue'
import Popup from './widgets/Popup.vue'

const app = inject('app')
const { proxy } = getCurrentInstance()
const parent = app

const header = ref(null)
const imgPopup = ref(null)
const copyPopup = ref(null)

const dataState = reactive({
  parent: "",
  data: {},
  date: "",
  date2: "",
  loader: 1,
  type: 0
})

const getFirstAndLastDate = () => {
  const year = new Date().getFullYear()
  const month = new Date().getMonth()
  const firstDay = new Date(year, month, 2)
  const lastDay = new Date(year, month + 1, 1)
  dataState.date = firstDay.toISOString().substring(0, 10)
  dataState.date2 = lastDay.toISOString().substring(0, 10)
}

const get = () => {
  const data = parent.toFormData(parent.state.formData)
  data.append('id', parent.state.user.id)
  data.append('type', 'user')
  if (dataState.date) data.append('date', dataState.date)
  if (dataState.date2) data.append('date2', dataState.date2)
  if (dataState.type) data.append('type', dataState.type)

  dataState.loader = 1

  proxy.$axios.post(`${parent.state.url}/site/getStatistics?auth=${parent.state.user.auth}`, data)
    .then(res => {
      dataState.loader = 0
      dataState.data = res.data

      if (res.data.types && res.data.types[0] && !dataState.type) {
        dataState.type = res.data.types[0].id
      }

      parent.state.formData.copy = dataState.data.multi
    })
    .catch(err => {
      console.log(err)
      parent.logout?.()
    })
}

const actionStatistic = () => {
  const data = parent.toFormData(parent.state.formData)
  data.append('uid', parent.state.user.id)

  proxy.$axios.post(`${parent.state.url}/site/actionStatistic?auth=${parent.state.user.auth}`, data)
    .then(res => {
      if (res.data.error) {
        header.value.$refs.msg.alertFun(res.data.error)
        return
      }

      if (parent.state.formData.id) {
        header.value.$refs.msg.successFun("Successfully updated banner!")
      } else {
        header.value.$refs.msg.successFun("Successfully added new banner!")
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
    parent.state.formData = {}
  } else {
    header.value.$refs.msg.alertFun("Use https!")
  }
}

const openMultiBanner = () => {
  parent.state.formData = dataState.data.multi
  copyPopup.value.active = 1
}

const openImage = (item) => {
  parent.state.formData = { ...item }
  imgPopup.value.active = 1
}

const togglePublish = (item) => {
  parent.state.formData = { ...item }
  actionStatistic()
}

onMounted(() => {
  dataState.parent = parent
  if (!parent.state.user) parent.logout?.()
  else {
    get()
    getFirstAndLastDate()
  }
})
</script>

<template>
  <div class="inside-content statistics">
    <Header ref="header" />

    <div id="spinner" v-if="dataState.loader"></div>

    <div class="wrapper">
      <div class="flex panel">
        <div class="w20 ptb15 al">
          <a href="#" class="btnS" @click.prevent="openMultiBanner">
            <i class="fas fa-images"></i> Multi banners
          </a>
        </div>

        <div class="date-range">
          <input type="date" v-model="dataState.date" @change="get()" />
          <span class="dash">–</span>
          <input type="date" v-model="dataState.date2" @change="get()" />
        </div>

        <div class="w20 al ptb10">
          <h2>Statistics</h2>
        </div>
      </div>

      <Popup ref="imgPopup" title="Banner">
        <div class="ac">
          <img :src="parent.state.url + '/uploads/' + parent.state.formData.img" v-if="parent.state.formData.img" />
        </div>
      </Popup>

      <Popup ref="copyPopup" title="Copy banner">
        <div class="form inner-form">
          <form v-if="parent.state.formData">
            <div class="row">
              <label>Code</label>
              <textarea v-model="parent.state.formData.copy"></textarea>
            </div>

            <div class="row">
              <label>Type</label>
              <select v-model="dataState.type" @change="get()" required>
                <option value="0">---</option>
                <option v-for="c in dataState.data.types || []" :key="c.id" :value="c.id">{{ c.title }}</option>
              </select>
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
              <th class="image"></th>
              <th class="image">Campaign</th>
              <th>Link</th>
              <th class="id">Views</th>
              <th class="id">Clicks</th>
              <th class="id">Leads</th>
              <th class="id">Fraud clicks</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dataState.data.items" :key="item.id">
              <td class="id">
                <Toogle v-model="item.published" @update:modelValue="togglePublish(item)" />
              </td>
              <td class="image">
                <a href="#" @click.prevent="openImage(item)">
                  <img :src="parent.state.url + '/' + item.img" />
                </a>
              </td>
              <td class="image">{{ item.campaign_title }}</td>
              <td>{{ item.link }}</td>
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
