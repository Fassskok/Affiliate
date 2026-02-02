<script setup>
import { ref, reactive, onMounted, inject, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import Header from './widgets/Header.vue'
import Toogle from './widgets/toogle.vue'
import Popup from './widgets/Popup.vue'
import Image from './widgets/Image.vue'
import Chart from 'chart.js/auto'


const app = inject('app')
const { proxy } = getCurrentInstance()

const route = useRoute()

const header = ref(null)
const newPopup = ref(null)
const adPopup = ref(null)
const chartPopup = ref(null)
const detailsPopup = ref(null)

const parent = app

const dataState = reactive({
  data: {},
  details: {},
  date: '',
  date2: '',
  q: '',
  sort: '',
  loader: 1,
  iChart: -1,
  id: 0,
  type: 0,
  all: true
})

onMounted(() => {
  console.log('CAMPAIGN MOUNTED', route.params.id)

  app.state.formData.date = ''
  app.state.formData.date2 = ''

  if (!app.state.user) {
    app.logout()
    return
  }

  get()
  // getFirstAndLastDate()
})

function getFirstAndLastDate() {
  const year = new Date().getFullYear()
  const month = new Date().getMonth()

  const firstDay = new Date(year, month, 2)
  const lastDay = new Date(year, month + 1, 1)

  dataState.date = firstDay.toISOString().substring(0, 10)
  dataState.date2 = lastDay.toISOString().substring(0, 10)
}

function get() {
  const data = parent.toFormData(parent.state.formData)

  if (dataState.date) data.append('date', dataState.date)
  if (dataState.date2) data.append('date2', dataState.date2)

  data.append('id', route.params.id)

  dataState.loader = 1

  proxy.$axios
    .post(`${parent.state.url}/site/getBanners?auth=${parent.state.user.auth}`, data)
    .then(res => {
      dataState.data = res.data
      dataState.types = res.data.types || []
      document.title = dataState.data?.info?.title || ''
      dataState.loader = 0

      if (dataState.iChart !== -1) {
        lineChart(dataState.data.items[dataState.iChart])
      }
    })
    .catch(err => {
      console.log(err)
      dataState.loader = 0
    })
}

function getCampaignBannersChart() {
  const data = parent.toFormData(parent.state.formData)

  if (dataState.date) data.append('date', dataState.date)
  if (dataState.date2) data.append('date2', dataState.date2)
  if (dataState.q) data.append('q', dataState.q)
  if (dataState.sort) data.append('sort', dataState.sort)

  dataState.loader = 1

  proxy.$axios
    .post(`${parent.state.url}/site/getCampaignBannersChart?auth=${parent.state.user.auth}`, data)
    .then(res => {
      const item = res.data.items
      if (!item) return

      let views = 0
      let clicks = 0
      let leads = 0

      for (const d in item.line) {
        views += Number(item.line[d].views || 0)
        clicks += Number(item.line[d].clicks || 0)
        leads += Number(item.line[d].leads || 0)
      }

      Object.assign(parent.state.formData, {
        views,
        clicks,
        leads,
        line: item.line,
        sites: item.sites
      })

      lineChart(item)
      dataState.loader = 0
    })
    .catch(err => {
      console.log(err)
      dataState.loader = 0
    })
}

function getDetails(id = false, type = false) {
  dataState.details = {}

  if (id) dataState.id = id
  if (type) dataState.type = type

  const data = parent.toFormData(parent.state.formData)

  if (dataState.date) data.append('date', dataState.date)
  if (dataState.date2) data.append('date2', dataState.date2)
  if (dataState.q) data.append('q', dataState.q)
  if (dataState.sort) data.append('sort', dataState.sort)
  if (dataState.id) data.append('bid', dataState.id)
  if (dataState.type) data.append('type', dataState.type)

  dataState.loader = 1

  proxy.$axios
    .post(`${parent.state.url}/site/getStatisticsDetails?auth=${parent.state.user.auth}`, data)
    .then(res => {
      dataState.details = res.data
      dataState.loader = 0
    })
    .catch(err => {
      console.log(err)
      dataState.loader = 0
    })
}

function actionCampaign() {
  const data = parent.toFormData(parent.state.formData)

  proxy.$axios
    .post(`${parent.state.url}/site/actionCampaign?auth=${parent.state.user.auth}`, data)
    .then(() => {
      newPopup.value.active = 0
      header.value.$refs.msg.successFun('Campaign saved')
      get()
    })
}

function actionAd() {
  parent.state.formData.copy = ''
  const data = parent.toFormData(parent.state.formData)
  data.append('campaign', route.params.id)

  proxy.$axios
    .post(`${parent.state.url}/site/actionBanner?auth=${parent.state.user.auth}`, data)
    .then(() => {
      adPopup.value.active = 0
      header.value.$refs.msg.successFun('Banner saved')
      get()
    })
}

function delAd() {
  header.value.$refs.msg
    .confirmFun('Confirm', 'Delete banner?')
    .then(ok => {
      if (!ok) return

      const data = parent.toFormData(parent.state.formData)

      proxy.$axios
        .post(`${parent.state.url}/site/deleteBanner?auth=${parent.state.user.auth}`, data)
        .then(() => {
          header.value.$refs.msg.successFun('Deleted')
          get()
        })
    })
}

function lineChart(item) {
  if (!item?.line) return

  setTimeout(() => {
    const dates = []
    const clicks = []
    const views = []

    for (const d in item.line) {
      dates.push(d)
      clicks.push(item.line[d].clicks)
      views.push(item.line[d].views)
    }

    document.getElementById('chartOuter').innerHTML =
      `<div id="chartHints">
        <div class="chartHintsViews">Views</div>
        <div class="chartHintsClicks">Clicks</div>
      </div>
      <canvas id="myChart"></canvas>`

    new Chart(document.getElementById('myChart'), {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          { label: 'Clicks', data: clicks, borderColor: '#00599D' },
          { label: 'Views', data: views, borderColor: '#5000B8' }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    })
  }, 100)
}

function checkAll(val) {
  if (parent.state.formData.sites) {
    parent.state.formData.sites.forEach(s => (s.include = val))
  }
  getCampaignBannersChart()
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
            <a class="btnS" href="#" @click.prevent="parent.state.formData = dataState.data.info; newPopup.active = 1; nextTick(() => adPopup.updatePosition?.());">
              <i class="fas fa-edit"></i> Edit campaign
            </a>
          </div>

          <div class="w50"></div>

          <div class="w30 ptb30">
            <h1 v-if="dataState.data?.info">
              {{ dataState.data.info.title }}
            </h1>
          </div>

        </div>
      </div>

      <Popup ref="chartPopup" fullscreen title="Chart">
        <div class="flex panel">

          <div class="w70 al">
            <div class="flex cubes" v-if="parent.state.formData">

              <div class="w30 ctr">
                <div>CTR</div>
                <span v-if="parent.state.formData.clicks && parent.state.formData.views">
                  {{
                    (
                      parent.state.formData.clicks * 100 /
                      parent.state.formData.views
                    ).toFixed(2)
                  }} %
                </span>
                <span v-else>0.00 %</span>
              </div>

              <div class="w30 clicks">
                <div>Clicks</div>
                {{ parent.state.formData.clicks }}
              </div>

              <div class="w30 views">
                <div>Views</div>
                {{ parent.state.formData.views }}
              </div>

              <div class="w30 leads">
                <div>Leads</div>
                {{ parent.state.formData.leads }}
              </div>

            </div>
          </div>

          <div class="date-range">
            <input type="date" v-model="dataState.date" @change="getCampaignBannersChart()" />
            –
            <input type="date" v-model="dataState.date2" @change="getCampaignBannersChart()" />
          </div>

        </div>

        <div class="flex body" v-if="parent.state.formData.line">

          <div class="w30 ar filchart">

            <div class="itemchart ptb10">
              All
              <Toogle
                :modelValue="dataState.all"
                @update:modelValue="val => { dataState.all = val; checkAll(val) }"
              />
            </div>

            <div
              class="itemchart ptb10"
              v-for="s in parent.state.formData.sites"
              :key="s.site"
            >
              {{ s.site }} (Views: {{ s.views }}, Clicks: {{ s.clicks }})
              <Toogle
                :modelValue="s.include"
                @update:modelValue="val => { s.include = val; getCampaignBannersChart() }"
              />
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

      <Popup ref="newPopup" :title="parent.state.formData?.id ? 'Edit campaign' : 'New campaign'">
        <div class="form inner-form">
          <form @submit.prevent="actionCampaign()" v-if="parent.state.formData">

            <div class="row">
              <label>Name</label>
              <input type="text" v-model="parent.state.formData.title" required />
            </div>

            <div class="row">
              <button class="btn">
                {{ parent.state.formData.id ? 'Edit' : 'Add' }}
              </button>
            </div>

          </form>
        </div>
      </Popup>
    </div>

    <div class="wrapper">
      <div class="flex panel">
        <div class="w20 al ptb20">
          <a class="btnS" href="#" @click.prevent="parent.state.formData = {}; adPopup.active = 1">
            <i class="fas fa-plus"></i> New
          </a>
        </div>

        <div class="date-range">
          <input type="date" v-model="dataState.date" @change="getCampaignBannersChart()" />
          <span class="dash">–</span>
          <input type="date" v-model="dataState.date2" @change="getCampaignBannersChart()" />
        </div>

        <div class="w20 ptb30">
          <h2>Ads</h2>
        </div>
      </div>

      <Popup ref="adPopup" :title="parent.state.formData?.id ? 'Edit banner' : 'New banner'" :maxHeight="'700px'">
        <div class="form inner-form">
          <form @submit.prevent="actionAd()" v-if="parent.state.formData">
            
            <div class="row">
              <label>Link</label>
              <input type="text" v-model="parent.state.formData.link" required />
            </div>

            <div class="row">
              <label>Description</label>
              <input type="text" v-model="parent.state.formData.description" />
            </div>

            <div class="row">
              <label>Type</label>
              <select v-model="parent.state.formData.type" required>
                <option value="0">---</option>
                <option v-for="c in dataState.types || []" :key="c.id" :value="c.id">{{ c.title }}</option>
              </select>
            </div>

            <div class="row">
              <label>Image</label>
              <Image v-model="parent.state.formData.img" :baseUrl="parent.state.url" />
            </div>

            <div class="row">
              <button class="btn" v-if="parent.state.formData?.id">Edit</button>
              <button class="btn" v-else>Add</button>
            </div>

          </form>
        </div>
      </Popup>

      <Popup ref="detailsPopup" fullscreen title="Details">
        <div class="flex panel">
          <div class="date-range">
            <input type="date" v-model="dataState.date" @change="getCampaignBannersChart()" />
            <span class="dash">–</span>
            <input type="date" v-model="dataState.date2" @change="getCampaignBannersChart()" />
          </div>
        </div>
        <br>
        <div class="table">
          <table v-if="Object.keys(dataState.details || {}).length">
            <thead>
              <tr>
                <th class="id">#</th>
                <th>Type</th>
                <th>
                  IP 
                  <i class="fas fa-caret-up" @click="dataState.sort='s.ip'; getDetails()" v-if="!dataState.sort"></i>
                  <i class="fas fa-caret-down" @click="dataState.sort=''; getDetails()" v-if="dataState.sort=='s.ip'" :class="{green:dataState.sort=='s.ip'}"></i>
                </th>
                <th class="id">Date</th>
                <th class="id">Site</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in dataState.details" :key="item.id">
                <td class="id">{{ item.id }}</td>
                <td>
                  <template v-if="item.type==1">Views</template>
                  <template v-else-if="item.type==2">Clicks</template>
                  <template v-else-if="item.type==3">Leads</template>
                </td>
                <td>{{ item.ip }}</td>
                <td>{{ item.date }}</td>
                <td>{{ item.site }}</td>
              </tr>
            </tbody>
          </table>
          <div class="empty" v-else>No items</div>
        </div>
      </Popup>

      <div class="table" v-if="dataState.data?.items?.length">
        <table>
          <thead>
            <tr>
              <th class="id">#</th>
              <th class="id"></th>
              <th class="image"></th>
              <th>Size</th>
              <th>Link</th>
              <th class="id">Views</th>
              <th class="id">Clicks</th>
              <th class="id">Leads</th>
              <th class="id">Fraud</th>
              <th class="actions">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in dataState.data.items" :key="item.id">

              <td class="id">{{ item.id }}</td>

              <td class="id">
                <Toogle
                  :modelValue="item.published"
                  @update:modelValue="val => { item.published = val; parent.state.formData = item; actionAd() }"
                />
              </td>

              <td class="image">
                <a href="#" @click.prevent="parent.state.formData = item; adPopup.active = 1">
                  <img :src="parent.state.url + '/' + item.img" />
                </a>
              </td>

              <td>{{ item.size }}</td>
              <td>{{ item.link }}</td>

              <td class="id">{{ item.views }}</td>
              <td class="id">{{ item.clicks || 0 }}</td>
              <td class="id">{{ item.leads || 0 }}</td>
              <td class="id">{{ item.fclicks || 0 }}</td>

              <td class="actions">
                <a href="#" @click.prevent="parent.state.formData = item; adPopup.active = 1">
                  <i class="fas fa-edit"></i>
                </a>
                <a href="#" @click.prevent="parent.state.formData = item; chartPopup.active = 1; getCampaignBannersChart()">
                  <i class="fas fa-chart-bar"></i>
                </a>
                <a href="#" @click.prevent="parent.state.formData = item; delAd()">
                  <i class="fas fa-trash-alt"></i>
                </a>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty" v-else>
        No items
      </div>

    </div>
  </div>
</template>

