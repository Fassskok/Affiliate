<script setup>
import { inject, reactive, ref, onMounted, getCurrentInstance } from 'vue'
import Header from './widgets/Header.vue'
import Toogle from './widgets/toogle.vue'
import Popup from './widgets/Popup.vue'


const app = inject('app')
const { proxy } = getCurrentInstance()
const parent = app

const header = ref(null)
const newPopup = ref(null)
const copyPopup = ref(null)

const dataState = reactive({
  parent: "",
  data: {},
  loader: 1,
  type: 0,
  uid: -1
})

const openNew = () => {
  parent.state.formData = {}
  newPopup.value.active = 1
}

const openCopy = (item, i) => {
  dataState.uid = i
  parent.state.formData = { ...item, copy: item.multi }
  copyPopup.value.active = 1
}

const togglePublish = (item) => {
  parent.state.formData = { ...item }
  action()
}

const get = () => {
  const data = parent.toFormData(parent.state.formData)
  if (dataState.type !== "") data.append('type', dataState.type)

  dataState.loader = 1

  proxy.$axios.post(`${parent.state.url}/site/getUsers?auth=${parent.state.user.auth}`, data)
    .then(res => {
      dataState.loader = 0
      dataState.data = res.data

      if (res.data.types && res.data.types[0] && !dataState.type) {
        dataState.type = res.data.types[0].id
      }

      if (dataState.uid > -1) {
        parent.state.formData.copy = dataState.data.items[dataState.uid].multi
      }
    })
    .catch(err => {
      console.log(err)
      parent.logout?.()
    })
}

const action = () => {
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

const del = async (item = null) => {
  if (item) parent.state.formData = { ...item }

  if (await header.value.$refs.msg.confirmFun("Please confirm next action", "Do you want to delete this user?")) {
    const data = parent.toFormData(parent.state.formData)
    proxy.$axios.post(`${parent.state.url}/site/deleteUser?auth=${parent.state.user.auth}`, data)
      .then(res => {
        if (res.data.error) header.value.$refs.msg.alertFun(res.data.error)
        else {
          header.value.$refs.msg.successFun("Successfully deleted user!")
          if (parent.state.user.id === parent.state.formData.id) parent.logout?.()
          else get()
        }
      })
      .catch(err => {
        console.log(err)
        header.value.$refs.msg.alertFun("Server error!")
      })
  }
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

onMounted(() => {
  dataState.parent = parent
  if (!parent.state.user) parent.logout?.()
  else get()
})
</script>


<template>
  <div class="inside-content users">
    <Header ref="header" />

    <div id="spinner" v-if="dataState.loader"></div>

    <div class="wrapper">
      <div class="flex panel">
        <div class="w20 al ptb20">
          <a class="btnS" href="#" @click.prevent="openNew">
            <i class="fas fa-plus"></i> New
          </a>
        </div>

        <div class="w70">
          <Search />
        </div>

        <div class="w10 ptb30">
          <h1>Users</h1>
        </div>
      </div>

      <Popup ref="newPopup" :title="parent.state.formData?.id ? 'Edit user' : 'New user'">
        <div class="form inner-form">
          <form @submit.prevent="action()" v-if="parent.state.formData">
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
              <button class="btn" v-if="parent.state.formData.id">Edit</button>
              <button class="btn" v-else>Add</button>
            </div>
          </form>
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

      <div class="table" v-if="!dataState.loader && dataState.data.items && dataState.data.items.length">
        <table>
          <thead>
            <tr>
              <th class="id">#</th>
              <th class="id"></th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th class="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in dataState.data.items" :key="item.id">
              <td class="id">{{ item.id }}</td>
              <td class="id">
                <Toogle v-model="item.published" @update:modelValue="togglePublish(item)" />
              </td>
              <td>
                <router-link :to="'/user/' + item.id">{{ item.user }}</router-link>
              </td>
              <td class="id">{{ item.phone }}</td>
              <td class="id">{{ item.email }}</td>
              <td class="actions">
                <a href="#" @click.prevent="del(item)">
                  <i class="fas fa-trash-alt"></i>
                </a>
                <a href="#" @click.prevent="openCopy(item, i)">
                  <i class="fas fa-images"></i>
                </a>
                <router-link :to="'/user/' + item.id">
                  <i class="fas fa-edit"></i>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty" v-if="!dataState.loader && (!dataState.data.items || !dataState.data.items.length)">
        No items
      </div>
    </div>
  </div>

</template>
