import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    room: undefined,
    username: undefined,
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
    leaveChat(state){
      state.room = undefined,
      state.username = undefined
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
    leaveChat({commit}){
      commit('leaveChat')
    }
  }
})
