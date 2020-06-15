import Vue from 'vue'
import Vuex from 'vuex'
import { STATUS_OPTIONS, url, STORE_ACTIONS } from '../utils/config'

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
      if (state.status === STATUS_OPTIONS.available) nextStatus = STATUS_OPTIONS.absent
      if (state.status === STATUS_OPTIONS.absent) nextStatus = STATUS_OPTIONS.unavailable
      if (state.status === STATUS_OPTIONS.unavailable) nextStatus = STATUS_OPTIONS.available

      state.status = nextStatus
    }
  },
  actions: {
    joinRoom({ commit }, data) {
      return new Promise(async (resolve, reject) => {
        try {
          const { body } = await Vue.http.post(`${url}/auth/login`, data)
          if (body.code === 400 || body.code === 401 || body.code === 500) {
            reject({ message: body.message })
          }
          commit(STORE_ACTIONS.joinRoom, data)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    },
    changeRoom({ commit }, room) {
      commit(STORE_ACTIONS.changeRoom, room)
    },
    setRooms({ commit }) {
      return new Promise(async (resolve, reject) => {
        try {
          // const rooms = await Vue.http.get(`http://${url}/rooms`)
          const rooms = [{
              id: 1,
              name: 'GENERAL'
            }, {
              id: 2,
              name: 'SPORTS'
            },{
              id: 3,
              name: 'GAMES'
            },
          ]
          commit(STORE_ACTIONS.setRooms, rooms)
          resolve(rooms)
        } catch (error) {
          reject(error)
        }
      })
    },
    leaveChat({ commit }, username) {
      return new Promise(async (resolve, reject) => {
        try {
          const { body : { code } } = await Vue.http.post(`${url}/auth/logout`, { username })
          if (code !== 200) reject()
          commit(STORE_ACTIONS.leaveChat)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    },
    changeStatus({ commit }) {
      commit(STORE_ACTIONS.changeStatus)
    }
  }
})
