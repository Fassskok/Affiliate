<script setup>
import { inject, reactive, ref, onMounted, getCurrentInstance } from 'vue'
import Header from './widgets/Header.vue'
import Toogle from './widgets/toogle.vue'
import Popup from './widgets/Popup.vue'

const app = inject('app')
const { proxy } = getCurrentInstance()

const header = ref(null)
const details = reactive({ active: 0 })
const newPopup = ref(null)

const parent = app

const dataState = reactive({
  parent: "",
  data: {},
  details: {},
  date: "",
  date2: "",
  q: "",
  sort: "",
  loader: 1,
  id: 0,
  type: 0,
  all: true
})

function openNew() {
  parent.state.formData = {}  
  newPopup.value.active = 1
}

function togglePublish(item) {
  parent.state.formData = { ...item }
  action()
}

onMounted(() => {
  dataState.parent = parent

  if (!parent.state.user || !parent.state.user.auth) {
    parent.page('/')
  }

  // this.GetFirstAndLastDate();
  get()
})

function GetFirstAndLastDate() {
  const year = new Date().getFullYear()
  const month = new Date().getMonth()

  const firstDayOfMonth = new Date(year, month, 2)
  const lastDayOfMonth = new Date(year, month + 1, 1)

  dataState.date = firstDayOfMonth.toISOString().substring(0, 10)
  dataState.date2 = lastDayOfMonth.toISOString().substring(0, 10)
}

function get() {
  const data = parent.toFormData(parent.state.formData)

  if (dataState.date !== "") data.append('date', dataState.date)
  if (dataState.date2 !== "") data.append('date2', dataState.date2)

  dataState.loader = 1

  proxy.$axios
    .post(
      parent.state.url + "/site/getCampaigns?auth=" + parent.state.user.auth,
      data
    )
  .then(response => {
    dataState.data = response.data
    if (!Array.isArray(dataState.data.items)) {
      dataState.data.items = []
    }
    dataState.loader = 0
  })
}

function action() {
  parent.state.formData.copy = ""

  const data = parent.toFormData(parent.state.formData)

  proxy.$axios
    .post(
      parent.state.url + "/site/actionCampaign?auth=" + parent.state.user.auth,
      data
    )
    .then(() => {
      newPopup.value.active = 0

      if (parent.state.formData.id) {
        header.value.$refs.msg.successFun("Successfully updated campaign!")
      } else {
        header.value.$refs.msg.successFun("Successfully added new campaign!")
      }

      get()
    })
    .catch(error => {
      console.log('errors: ', error)
    })
}

async function del(item = null) {
  if (item) parent.state.formData = { ...item }

  if (
    await header.value.$refs.msg.confirmFun(
      "Please confirm next action",
      "Do you want to delete this campaign?"
    )
  ) {
    const data = parent.toFormData(parent.state.formData)

    proxy.$axios
      .post(
        parent.state.url + "/site/deleteCampaign?auth=" + parent.state.user.auth,
        data
      )
      .then(response => {
        if (response.data.error) {
          header.value.$refs.msg.alertFun(response.data.error)
        } else {
          header.value.$refs.msg.successFun("Successfully deleted campaign!")
          get()
        }
      })
      .catch(error => {
        console.log('errors: ', error)
        header.value.$refs.msg.alertFun("Server error!")
      })
  }
}
</script>


<template>
  <div class="inside-content campaigns">
    <Header ref="header" />

    <div id="spinner" v-if="dataState.loader"></div>

    <div class="wrapper">
      <div class="flex panel">
        <div class="al">
          <a class="btnS" href="#" @click.prevent="openNew">
            <i class="fas fa-plus"></i> New
          </a>
        </div>

        <div class="w60 ac date-range">
          <input type="date" v-model="dataState.date" @change="get()" />
          <span class="dash">–</span>
          <input type="date" v-model="dataState.date2" @change="get()" />
        </div>

        <div class="w20 al">
          <h1>Campaigns</h1>
        </div>
      </div>

      <Popup ref="newPopup" :title="parent.state.formData?.id ? 'Edit campaign' : 'New campaign'">
        <div class="form inner-form">
          <form @submit.prevent="action()" v-if="parent.state.formData">
            <div class="row">
              <label>Name</label>
              <input type="text" v-model="parent.state.formData.title" required />
            </div>
            <div class="row">
              <button class="btn" v-if="parent.state.formData.id">Edit</button>
              <button class="btn" v-else>Add</button>
            </div>
          </form>
        </div>
      </Popup>

      <div class="table" v-if="dataState.data.items && dataState.data.items.length">
        <table>
          <thead>
            <tr>
              <th class="id">#</th>
              <th class="id"></th>
              <th>Title</th>
              <th class="id">Views</th>
              <th class="id">Clicks</th>
              <th class="id">Leads</th>
              <th class="id">Fraud clicks</th>
              <th class="actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in dataState.data.items" :key="item.id">
              <td class="id">{{ item.id }}</td>

              <td class="id">
                <Toogle v-model="item.published" @update:modelValue="togglePublish(item)" />
              </td>

              <td>
                <router-link :to="'/campaign/' + item.id">{{ item.title }}</router-link>
              </td>

              <td class="id">
                <a href="#" @click.prevent="details.active = 1">{{ item.views }}</a>
              </td>
              <td class="id">
                <a href="#" @click.prevent="details.active = 1">{{ item.clicks || 0 }}</a>
              </td>
              <td class="id">
                <a href="#" @click.prevent="details.active = 1">{{ item.leads || 0 }}</a>
              </td>
              <td class="id">
                <a href="#" @click.prevent="details.active = 1">{{ item.fclicks || 0 }}</a>
              </td>

              <td class="actions">
                <a href="#" @click.prevent="del(item)">
                  <i class="fas fa-trash-alt"></i>
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

