<script setup>
import { inject, reactive, ref, onMounted, getCurrentInstance } from 'vue'
import Header from './widgets/Header.vue'

const app = inject('app')
const { proxy } = getCurrentInstance()

/* refs (аналог $refs) */
const header = ref(null)
const details = ref(null)
const newPopup = ref(null)

/* data() */
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

/* mounted() */
onMounted(() => {
  dataState.parent = parent

  if (!parent.state.user || !parent.state.user.auth) {
    parent.page('/')
  }

  get()
  GetFirstAndLastDate()
})

/* methods */
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
      dataState.loader = 0
    })
    .catch(() => {
      parent.logout()
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

async function del() {
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
        <div class="w20"></div>
        <div class="w60 ac date-range">
            <input type="date" v-model="dataState.date" @change="get()" />
            <span class="dash">–</span>
            <input type="date" v-model="dataState.date2" @change="get()" />
        </div>
        <div class="w20 al">
            <h1>Campaigns</h1>
        </div>
    </div>

      <div class="table" v-if="dataState.data.items">
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
              <td class="id"></td>

              <td>
                <router-link :to="'/campaign/' + item.id">
                  {{ item.title }}
                </router-link>
              </td>

              <td class="id">
                <a href="#" @click.prevent="details.active = 1">
                  {{ item.views }}
                </a>
              </td>

              <td class="id">
                <a href="#" @click.prevent="details.active = 1">
                  {{ item.clicks ? item.clicks : 0 }}
                </a>
              </td>

              <td class="id">
                <a href="#" @click.prevent="details.active = 1">
                  {{ item.leads ? item.leads : 0 }}
                </a>
              </td>

              <td class="id">
                <a href="#" @click.prevent="details.active = 1">
                  {{ item.fclicks ? item.fclicks : 0 }}
                </a>
              </td>

              <td class="actions">
                <a
                  href="#"
                  @click.prevent="
                    parent.state.formData = item;
                    del();
                  "
                >
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
