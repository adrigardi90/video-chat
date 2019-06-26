import Vue from 'vue'
import Vuex from 'vuex'
import { STATUS_OPTIONS } from './utils/config'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    room: undefined,
    username: undefined,
    status: STATUS_OPTIONS.available,
    rooms: []
  },
  mutations: {
    joinRoom(state, { room, username }) {
      state.room = room
      state.username = username
    },
    changeRoom(state, room) {
      state.room = room
    },
    setRooms(state, rooms) {
      state.rooms = rooms
    },
    leaveChat(state) {
      state.room = undefined
      state.username = undefined
    },
    changeStatus(state) {
      let nextStatus 
      if(state.status === STATUS_OPTIONS.available) nextStatus = STATUS_OPTIONS.absent
      if(state.status === STATUS_OPTIONS.absent) nextStatus = STATUS_OPTIONS.unavailable
      if(state.status === STATUS_OPTIONS.unavailable) nextStatus = STATUS_OPTIONS.available

      state.status = nextStatus
    }
  },
  actions: {
    joinRoom({ commit }, information) {
      commit('joinRoom', information)
    },
    changeRoom({ commit }, room) {
      commit('changeRoom', room)
    },
    setRooms({ commit }, rooms) {
      commit('setRooms', rooms)
    },
    leaveChat({ commit }) {
      commit('leaveChat')
    },
    changeStatus({ commit }) {
      commit('changeStatus')
    }
  }
})
