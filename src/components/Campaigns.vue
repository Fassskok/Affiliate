<script setup>
import { inject, reactive, ref, onMounted, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from './widgets/Header.vue'
import Toogle from './widgets/toogle.vue'
import Popup from './widgets/Popup.vue'
import Chart from 'chart.js/auto'

const router = useRouter()

const app = inject('app')
const { proxy } = getCurrentInstance()

const header = ref(null)
const details = reactive({ active: 0 })
const newPopup = ref(null)

const chartPopup = ref(null)
const detailsPopup = ref(null)
const iChart = ref(-1)
const all = ref(true)

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
  iChart: -1,
  id: 0,
  type: 0,
  all: true
})

function goCampaign(id) {
  router.push({ name: 'Campaign', params: { id } })
}


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

function getDetails(campaign = false, type = false) {
  dataState.details = {}
  if (campaign) dataState.id = campaign
  if (type) dataState.type = type
  if (dataState.id) campaign = dataState.id
  if (dataState.type) type = dataState.type

  const data = parent.toFormData(parent.state.formData)
  if (dataState.date) data.append('date', dataState.date)
  if (dataState.date2) data.append('date2', dataState.date2)
  if (dataState.q) data.append('q', dataState.q)
  if (dataState.sort) data.append('sort', dataState.sort)
  if (campaign) data.append('campaign', campaign)
  if (type) data.append('type', type)

  dataState.loader = 1

  proxy.$axios.post(`${parent.state.url}/site/getStatisticsDetails?auth=${parent.state.user.auth}`, data)
    .then(res => {
      dataState.details = res.data
      dataState.loader = 0
    })
    .catch(err => {
      console.log(err)
      parent.logout?.()
    })
}

function lineChart(item) {
  if (!item) return
  setTimeout(() => {
    const dates = [], clicks = [], views = [], leads = []
    for (let i in item.line) {
      dates.push(i)
      clicks.push(item.line[i].clicks)
      views.push(item.line[i].views)
      leads.push(item.line[i].leads)
    }

    document.getElementById('chartOuter').innerHTML =
      '<div id="chartHints"><div class="chartHintsViews">Views</div><div class="chartHintsClicks">Clicks</div></div><canvas id="myChart"></canvas>'

    const ctx = document.getElementById('myChart')
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          { label: 'Clicks', backgroundColor: '#00599D', borderColor: '#00599D', data: clicks },
          { label: 'Views', backgroundColor: '#5000B8', borderColor: '#5000B8', data: views }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: { title: ctx => ctx[0].dataset.label }
          },
          legend: { display: false }
        },
        scales: { y: { position: 'right' }, x: { afterFit: scale => scale.height = 120 } }
      }
    })
  }, 100)
}


function getCampaignChart() {
  const data = parent.toFormData(parent.state.formData)
  if (dataState.date) data.append('date', dataState.date)
  if (dataState.date2) data.append('date2', dataState.date2)

  dataState.loader = 1

  proxy.$axios.post(`${parent.state.url}/site/getCampaignChart?auth=${parent.state.user.auth}`, data)
    .then(res => {
      const item = res.data.items
      if (!item) return

      let totalViews = 0, totalClicks = 0, totalLeads = 0
      for (const date in item.line) {
        const row = item.line[date]
        totalViews += Number(row.views || 0)
        totalClicks += Number(row.clicks || 0)
        totalLeads += Number(row.leads || 0)
      }

      Object.assign(parent.state.formData, {
        views: totalViews,
        clicks: totalClicks,
        leads: totalLeads,
        line: item.line,
        sites: item.sites
      })

      lineChart(item)
      dataState.loader = 0
    })
}

function checkAll(prop) {
  if (parent.state.formData.sites) {
    for (let s of parent.state.formData.sites) {
      s.include = prop
    }
  }
  getCampaignChart()
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
  <div class="inside-content">
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

      <Popup ref="chartPopup" :fullscreen="true" title="Chart">
          <div class="flex panel">
            <div class="w70 al">
              <div class="flex cubes">
                <div class="w30 ctr">
                  <div>CTR</div>
                  <span v-if="parent.state.formData.clicks && parent.state.formData.views">
                    {{ (parent.state.formData.clicks * 100 / parent.state.formData.views).toFixed(2) }} %
                  </span>
                  <span v-else>0.00 %</span>
                </div>
                <div class="w30 leads">
                  <div>Leads</div>
                  {{ parent.state.formData.leads }}
                </div>
                <div class="w30 views">
                  <div>Views</div>
                  {{ parent.state.formData.views }}
                </div>
                <div class="w30 clicks">
                  <div>Clicks</div>
                  {{ parent.state.formData.clicks }}
                </div>
              </div>
            </div>

            <div class="date-range">
              <input type="date" v-model="dataState.date" @change="getCampaignChart()" />
              <span class="dash">–</span>
              <input type="date" v-model="dataState.date2" @change="getCampaignChart()" />
            </div>
          </div>
        <div class="flex body">
          <div class="w30 ar filchart">
            <div class="itemchart ptb10">
              All
              <Toogle :modelValue="all" @update:modelValue="all=$event; checkAll($event)" />
            </div>

            <div class="itemchart ptb10" v-for="s in (parent.state.formData.sites || [])" :key="s.site">
              {{ s.site }}
              <Toogle :modelValue="s.include" @update:modelValue="s.include=$event; getCampaignChart()" />
            </div>
          </div>

          <div class="w70" id="chartOuter">
            <div id="chartHints">
              <div class="chartHintsViews">Views</div>
              <div class="chartHintsClicks">Clicks</div>
            </div>
            <canvas id="myChart"></canvas>
          </div>
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
                <a href="#" @click.prevent="details.active = 1; getDetails(item.id, 1)">{{ item.views }}</a>
              </td>
              <td class="id">
                <a href="#" @click.prevent="details.active = 1; getDetails(item.id, 2)">{{ item.clicks || 0 }}</a>
              </td>
              <td class="id">
                <a href="#" @click.prevent="details.active = 1; getDetails(item.id, 2)">{{ item.leads || 0 }}</a>
              </td>
              <td class="id">
                <a href="#" @click.prevent="details.active = 1; getDetails(item.id, 3)">{{ item.fclicks || 0 }}</a>
              </td>

              <td class="actions">
                <a href="#" @click.prevent="del(item)">
                  <i class="fas fa-trash-alt"></i>
                </a>
                <a href="#" @click.prevent="parent.state.formData = { ...item }; iChart = i; $refs.chartPopup.active = 1; getCampaignChart();">
                  <i class="fas fa-chart-bar"></i>
                </a>
                <a href="#" @click.prevent.stop="goCampaign(item.id)">
                  <i class="fas fa-edit"></i>
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

