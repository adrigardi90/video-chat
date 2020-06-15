<template>
  <div class="options">
    <h2>VIDEO CHAT</h2>
    <div>
      <form novalidate class="md-layout" @submit.prevent="submitForm">
        <md-field>
          <label>Username</label>
          <md-input 
            v-model="username" 
            type="string" 
            id="username">
          </md-input>
        </md-field>
        <md-field>
          <label for="movie">Room</label>
          <md-select v-model="room" name="room" id="room">
            <md-option 
              v-for="room in rooms" 
              :key="room.id" 
              :value="room.name">{{room.name}}
            </md-option>
          </md-select>
        </md-field>
        <div v-if="error" class="options-error">
          <p>{{error}}</p>
        </div>
        <div class="options__submit">
          <md-button 
            type="submit" 
            class="md-raised md-primary" 
            :disabled="!(username && room)">JOIN
          </md-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { STORE_ACTIONS } from "./../utils/config"

export default {
  name: "home",
  sockets:{
    connect() {
      this.$router.push("/chat")
    }
  },
  data: () => ({
    username: undefined,
    room: undefined,
    rooms: [],
    error: undefined,
    defaultError: 'Something went wrong' 
  }),
  async created() {
    try {
      this.rooms  = await this.$store.dispatch(STORE_ACTIONS.setRooms)
    } catch (error) {
      this.error = this.defaultError
    }
  },
  methods: {
    async submitForm() {
      if(!(this.username && this.room)) return
      this.error = undefined
      
      try {
        await this.$store.dispatch(STORE_ACTIONS.joinRoom, {
          room: this.room,
          username: this.username
        })
        this.$socket.open()
      } catch (error) {
        this.error = error.message ? error.message : this.defaultError
      }
    }
  }
}
</script>

<style lang="scss">
.options {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  flex-direction: column;
  & h2 {
    padding-bottom: 4rem;
  }

  & form {
    width: 460px;
  }
  &__submit {
    width: 100%;
  }
  &-error{
    width: 100%;
    p {
      color: red
    }
  }
}
</style>
