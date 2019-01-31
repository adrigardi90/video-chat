import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    room: undefined,
    username: undefined
  },
  mutations: {
    joinRoom(state, { room, username }) {
      state.room = room
      state.username = username
    },
    changeRoom(state, room) {
      state.room = room
    }
  },
  actions: {
    joinRoom({ commit }, information) {
      commit('joinRoom', information)
    },
    changeRoom({ commit }, room) {
      commit('changeRoom', room)
    }
  }
})
