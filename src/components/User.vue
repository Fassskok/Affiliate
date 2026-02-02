<script setup>
import { inject, reactive, ref, onMounted, getCurrentInstance, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from './widgets/Header.vue'
import Toogle from './widgets/toogle.vue'
import Popup from './widgets/Popup.vue'
import Chart from 'chart.js/auto'

const route = useRoute()
const router = useRouter()
const app = inject('app')
const { proxy } = getCurrentInstance()

const parent = app
const header = ref(null)
const newPopup = ref(null)
const chartPopup = ref(null)

const myChart = ref(null)
let chartInstance = null

const dataState = reactive({
  parent: "",
  data: {},
  user: [],
  tab: 0,
  tabs: ["Payments", "Sites", "Statistics"],
  date: "",
  date2: "",
  iChart: -1,
  loader: 1
})

onMounted(() => {
  dataState.parent = parent

  if (!parent.state.user) {
    parent.logout?.()
    return
  }

  if (!route.params.id) router.push('/users')

  GetFirstAndLastDate()
  get()
})

function GetFirstAndLastDate() {
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 2)
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  dataState.date = firstDayOfMonth.toISOString().substring(0, 10)
  dataState.date2 = lastDayOfMonth.toISOString().substring(0, 10)
}

function get() {
  const data = parent.toFormData(parent.state.formData)
  data.append('id', route.params.id)
  data.append('uid', route.params.id)
  if (dataState.date) data.append('date', dataState.date)
  if (dataState.date2) data.append('date2', dataState.date2)

  dataState.loader = 1

  proxy.$axios.post(`${parent.state.url}/site/getUser?auth=${parent.state.user.auth}`, data)
    .then(res => {
      dataState.loader = 0
      dataState.data = res.data
      if (res.data.info) {
        parent.state.formData = res.data.info
        document.title = res.data.info.user
      }
    })
    .catch(err => {
      console.log(err)
      parent.logout?.()
    })
}

function action() {
  const data = parent.toFormData(parent.state.formData)
  proxy.$axios.post(`${parent.state.url}/site/actionUser?auth=${parent.state.user.auth}`, data)
    .then(res => {
      if (res.data.error) {
        header.value.$refs.msg.alertFun(res.data.error)
        return
      }

      newPopup.value.active = 0

      if (parent.state.formData.id) {
        header.value.$refs.msg.successFun("Successfully updated user!")
      } else {
        header.value.$refs.msg.successFun("Successfully added new user!")
      }

      get()
    })
    .catch(err => console.log(err))
}

async function del() {
  if (!await header.value.$refs.msg.confirmFun("Please confirm next action", "Do you want to delete this user?")) return

  const data = parent.toFormData(parent.state.formData)
  proxy.$axios.post(`${parent.state.url}/site/deleteUser?auth=${parent.state.user.auth}`, data)
    .then(res => {
      if (res.data.error) {
        header.value.$refs.msg.alertFun(res.data.error)
      } else {
        header.value.$refs.msg.successFun("Successfully deleted user!")
        get()
      }
    })
    .catch(err => {
      console.log(err)
      header.value.$refs.msg.alertFun("Server error!")
    })
}

function actionStatistic() {
  const data = parent.toFormData(parent.state.formData)
  data.append('id', route.params.id)

  proxy.$axios.post(`${parent.state.url}/site/actionStatistic?auth=${parent.state.user.auth}`, data)
    .then(res => {
      if (res.data.error) return header.value.$refs.msg.alertFun(res.data.error)
      header.value.$refs.msg.successFun("Successfully updated banner!")
      get()
    })
    .catch(err => console.log(err))
}

function actionPayment() {
  const data = parent.toFormData(parent.state.formData)
  data.append('uid', route.params.id)

  proxy.$axios.post(`${parent.state.url}/site/actionPayment?auth=${parent.state.user.auth}`, data)
    .then(res => {
      if (res.data.error) return header.value.$refs.msg.alertFun(res.data.error)
      header.value.$refs.msg.successFun("Successfully updated payment!")
      get()
    })
    .catch(err => console.log(err))
}

async function delPayment() {
  if (!await header.value.$refs.msg.confirmFun("Please confirm next action", "Do you want to delete this payment?")) return

  const data = parent.toFormData(parent.state.formData)
  proxy.$axios.post(`${parent.state.url}/site/deletePayment?auth=${parent.state.user.auth}`, data)
    .then(res => {
      if (res.data.error) return header.value.$refs.msg.alertFun(res.data.error)
      header.value.$refs.msg.successFun("Successfully deleted payment!")
      get()
    })
    .catch(err => {
      console.log(err)
      header.value.$refs.msg.alertFun("Server error!")
    })
}

function actionSite() {
  const data = parent.toFormData(parent.state.formData)
  proxy.$axios.post(`${parent.state.url}/site/actionSite?auth=${parent.state.user.auth}`, data)
    .then(() => {
      if (parent.state.formData.id) {
        header.value.$refs.msg.successFun("Successfully updated site!")
      } else {
        header.value.$refs.msg.successFun("Successfully added new site!")
      }
      get()
    })
    .catch(err => console.log(err))
}

function lineChart(item) {
  if (!item?.line) return

  nextTick(() => {
    const ctx = myChart.value?.getContext('2d')
    if (!ctx) return

    const dates = []
    const clicks = []
    const views = []

    for (const d in item.line) {
      dates.push(d)
      clicks.push(item.line[d].clicks)
      views.push(item.line[d].views)
    }

    if (chartInstance) chartInstance.destroy()

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          { label: 'Clicks', data: clicks, borderColor: '#00599D', fill: false },
          { label: 'Views', data: views, borderColor: '#5000B8', fill: false }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    })
  })
}

</script>

<template>
  <div class="inside-content">
    <Header ref="header" />
    <div id="spinner" v-if="dataState.loader"></div>
    <div class="panelTop">
      <div class="wrapper">
        <div class="flex">
          <div class="w20 al ptb20">
            <a class="btnS" href="#" @click.prevent="$refs.newPopup.active = 1; parent.state.formData = {}">
              <i class="fas fa-plus"></i> Edit user
            </a>
          </div>
          <div class="w60"></div>
          <div class="w20 ptb30 pb0 ml-auto">
            <h1 v-if="dataState.data && dataState.data.info">{{ dataState.data.info.user }}</h1>
          </div>
        </div>

        <div class="flex" v-if="dataState.data && dataState.data.info">
        <div class="w50 ml-auto info-right">
            <p><b>Email:</b> {{ dataState.data.info.email }}</p>
            <p><b>Phone:</b> {{ dataState.data.info.phone }}</p>
        </div>
        </div>

        <div class="tabs ar">
          <ul>
            <li v-for="(t, i) in dataState.tabs" :key="i" :class="{active: dataState.tab === i}" @click="dataState.tab = i">
              {{ t }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <Popup ref="newPopup" :title="(parent.state.formData?.id) ? 'Edit user' : 'New user'">
      <div class="form inner-form">
        <form @submit.prevent="action" v-if="parent.state.formData">
          <div class="row">
            <label>Name</label>
            <input type="text" v-model="parent.state.formData.user" required />
          </div>
          <div class="row">
            <label>Phone</label>
            <input type="text" v-model="parent.state.formData.phone" required />
          </div>
          <div class="row">
            <label>Email</label>
            <input type="text" v-model="parent.state.formData.email" required />
          </div>
          <div class="row">
            <label>Password</label>
            <input type="text" v-model="parent.state.formData.password" />
          </div>
          <div class="row">
            <button class="btn" v-if="parent.state.formData?.id">Edit</button>
            <button class="btn" v-else>Add</button>
          </div>
        </form>
      </div>
    </Popup>

    <div v-if="dataState.tab === 1" class="wrapper">
      <div class="flex panel">
        <div class="date-range">
          <input type="date" v-model="dataState.date" @change="get" />
          <span class="dash">–</span>
          <input type="date" v-model="dataState.date2" @change="get" />
        </div>
        <div class="w20 ptb10">
          <h2>{{ dataState.tabs[dataState.tab] }}</h2>
        </div>
      </div>

      <Popup ref="chartPopup" :fullscreen="true" title="Chart">
        <div class="flex panel">
          <div class="w70 al">
            <div class="flex cubes">
              <div class="w30 ctr">
                <div>CTR</div>
                <span v-if="dataState.data.sites[dataState.iChart]?.clicks && dataState.data.sites[dataState.iChart]?.views">
                  {{ (dataState.data.sites[dataState.iChart].clicks*100 / dataState.data.sites[dataState.iChart].views).toFixed(2) }} %
                </span>
                <span v-else>0.00 %</span>
              </div>
              <div class="w30 leads">
                <div>Leads</div>
                {{ dataState.data.sites[dataState.iChart]?.leads }}
              </div>
              <div class="w30 views">
                <div>Views</div>
                {{ dataState.data.sites[dataState.iChart]?.views }}
              </div>
              <div class="w30 clicks">
                <div>Clicks</div>
                {{ dataState.data.sites[dataState.iChart]?.clicks }}
              </div>
            </div>
          </div>
          <div class="date-range">
            <input type="date" v-model="dataState.date" @change="get" />
            <span class="dash">–</span>
            <input type="date" v-model="dataState.date2" @change="get" />
          </div>
        </div>

        <div class="flex body">
          <div class="w30 ar filchart"></div>
            <div class="w70" id="chartOuter">
            <div id="chartHints">
                <div class="chartHintsViews">Views</div>
                <div class="chartHintsClicks">Clicks</div>
            </div>
            <canvas ref="myChart"></canvas>
            </div>
        </div>
      </Popup>

      <div class="table" v-if="dataState.data.sites?.length">
        <table>
          <thead>
            <tr>
              <th class="id"></th>
              <th class="image">Site</th>
              <th class="id">Views</th>
              <th class="id">Clicks</th>
              <th class="id">Leads</th>
              <th class="id">Fraud clicks</th>
              <th class="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in dataState.data.sites" :key="i">
              <td class="id">
                <Toogle v-model="item.published" @update:modelValue="parent.state.formData = { ...item }; action()" />
              </td>
              <td class="image">{{ item.site }}</td>
              <td class="id">{{ item.views }}</td>
              <td class="id">{{ item.clicks || 0 }}</td>
              <td class="id">{{ item.leads || 0 }}</td>
              <td class="id">
                <a href="#" @click.prevent="$refs.detailsPopup.active=1; getDetails(item.id, 4)">
                  {{ item.fclicks || 0 }}
                </a>
              </td>
              <td class="actions">
                <a href="#" @click.prevent="parent.state.formData = { ...item }; dataState.iChart = i; $refs.chartPopup.active = 1; lineChart(item)">  
                  <i class="fas fa-chart-bar"></i>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="empty" v-else>No items</div>
    </div>

    <div v-if="dataState.tab === 0" class="wrapper">
      <div class="flex panel">
        <div class="w20 al ptb15">
          <a class="btnS" href="#" @click.prevent="parent.state.formData = {}; $refs.payment.active=1">
            <i class="fas fa-plus"></i> Add payment
          </a>
        </div>
        <div class="w50"></div>
        <div class="ptb10">
          <h2>{{ dataState.tabs[dataState.tab] }}</h2>
        </div>
      </div>

      <Popup ref="payment" :title="parent.state.formData?.id ? 'Edit payment' : 'New payment'">
        <div class="form inner-form">
          <form @submit.prevent="actionPayment()" v-if="parent.state.formData">
            <div class="row">
              <label>Value</label>
              <input type="number" v-model="parent.state.formData.value" required />
            </div>
            <div class="row">
              <label>Date</label>
              <input type="date" v-model="parent.state.formData.date" required />
            </div>
            <div class="row">
              <label>Description</label>
              <input type="text" v-model="parent.state.formData.description" required />
            </div>
            <div class="row">
              <button class="btn" v-if="parent.state.formData?.id">Edit</button>
              <button class="btn" v-else>Add</button>
            </div>
          </form>
        </div>
      </Popup>

      <div class="table" v-if="dataState.data.payments?.length">
        <table>
          <thead>
            <tr>
              <th class="id">#</th>
              <th class="id">Value</th>
              <th>Date</th>
              <th>Description</th>
              <th class="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dataState.data.payments" :key="item.id">
              <td class="id">{{ item.id }}</td>
              <td class="id">
                <a href="#" @click.prevent="parent.state.formData = { ...item }; $refs.payment.active=1">
                  {{ item.value }}
                </a>
              </td>
              <td>
                <a href="#" @click.prevent="parent.state.formData = { ...item }; $refs.payment.active=1">
                  {{ item.date_title }}
                </a>
              </td>
              <td>{{ item.description }}</td>
              <td class="actions">
                <a href="#" @click.prevent="parent.state.formData = { ...item }; del()">
                  <i class="fas fa-trash-alt"></i>
                </a>
                <a href="#" @click.prevent="parent.state.formData = { ...item }; $refs.payment.active=1">
                  <i class="fas fa-edit"></i>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="empty" v-else>No items</div>
    </div>

    <div v-if="dataState.tab === 2" class="wrapper">
      <div class="flex panel">
        <div class="date-range">
          <input type="date" v-model="dataState.date" @change="get" />
          <span class="dash">–</span>
          <input type="date" v-model="dataState.date2" @change="get" />
        </div>
        <div class="w20 ptb10">
          <h2>{{ dataState.tabs[dataState.tab] }}</h2>
        </div>
      </div>

      <Popup ref="imgPopup" title="Banner">
        <div class="ac">
          <img :src="parent.state.url + '/' + parent.state.formData.img" v-if="parent.state.formData.img" />
        </div>
      </Popup>

      <div class="table" v-if="dataState.data.statistics?.length">
        <table>
          <thead>
            <tr>
              <th class="id"></th>
              <th class="image"></th>
              <th class="image">Campaign</th>
              <th>Size</th>
              <th>Link</th>
              <th class="id">Views</th>
              <th class="id">Clicks</th>
              <th class="id">Leads</th>
              <th class="id">Fraud clicks</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dataState.data.statistics" :key="item.id">
              <td class="id">
                <Toogle v-model="item.published" @update:modelValue="parent.state.formData = { ...item }; action()" />
              </td>
              <td class="image">
                <a href="#" @click.prevent="$refs.imgPopup.active=1; parent.state.formData = { ...item }">
                  <img :src="parent.state.url + '/' + item.img" />
                </a>
              </td>
              <td class="image">{{ item.campaign_title }}</td>
              <td class="image">{{ item.size }}</td>
              <td>{{ item.link }}</td>
              <td class="id">{{ item.views }}</td>
              <td class="id">{{ item.clicks || 0 }}</td>
              <td class="id">{{ item.leads || 0 }}</td>
              <td class="id">
                <a href="#" @click.prevent="$refs.detailsPopup.active=1; getDetails(item.id, 4)">
                  {{ item.fclicks || 0 }}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="empty" v-else>No items</div>
    </div>
  </div>
</template>


