import Vue from 'vue'
import Vuex from 'vuex'
import moduleCopyright from 'packages/store/modules/copyright'
Vue.use(Vuex)

const store = new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    copyright: moduleCopyright
  }
})

export default store
