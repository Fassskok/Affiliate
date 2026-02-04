<script setup>
import { inject, reactive, ref, onMounted, getCurrentInstance } from 'vue'
import Header from './widgets/Header.vue'
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
  loader: 1
})

const get = () => {
  const data = parent.toFormData(parent.state.formData)
  data.append('uid', parent.state.user.id)
  data.append('type', 'user')

  dataState.loader = 1

  proxy.$axios.post(`${parent.state.url}/site/getBanners?auth=${parent.state.user.auth}`, data)
    .then(res => {
      dataState.loader = 0
      dataState.data = res.data
    })
    .catch(err => {
      console.log(err)
      parent.logout?.()
    })
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

const openImage = (item) => {
  parent.state.formData = { ...item }
  imgPopup.value.active = 1
}

const openCopy = (item) => {
  parent.state.formData = { ...item }
  copyPopup.value.active = 1
}

onMounted(() => {
  dataState.parent = parent
  if (!parent.state.user) parent.logout?.()
  else get()
})
</script>

<template>
  <div class="inside-content ads">
    <Header ref="header" />

    <div id="spinner" v-if="dataState.loader"></div>

    <div class="wrapper">
      <div class="flex panel">
        <div class="w20 al ptb20"></div>
        <div class="w70"></div>
        <div class="w10 ptb30">
          <h1>Ads</h1>
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

      <Popup ref="imgPopup" title="Banner">
        <div class="ac">
          <img :src="parent.state.url + '/' + parent.state.formData.img" v-if="parent.state.formData.img"/>
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
              <th class="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dataState.data.items" :key="item.id">
              <td class="id">{{ item.id }}</td>
              <td class="image">
                <a href="#" @click.prevent="openImage(item)">
                  <img :src="parent.state.url + '/' + item.img" />
                </a>
              </td>
              <td class="image">{{ item.campaign_title }}</td>
              <td>{{ item.link }}</td>
              <td class="actions">
                <a href="#" @click.prevent="openCopy(item)">
                  <i class="fas fa-copy"></i>
                </a>
              </td>
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
