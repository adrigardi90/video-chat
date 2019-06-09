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
import { url, STORE_ACTIONS } from "./../utils/config";

export default {
  name: "home",
  data: function() {
    return {
      username: undefined,
      room: undefined,
      rooms: [],
      error: undefined,
      defaultError: 'Something went wrong' 
    };
  },
  async created() {
    try {
      const data = await this.$http.get(`http://${url}/rooms`)
      this.rooms = data.body;
      this.$store.dispatch(STORE_ACTIONS.setRooms, this.rooms)
    } catch (error) {
      this.error = this.defaultError
      console.log(error);
    }
  },
  methods: {
    async submitForm() {
      if(!(this.username && this.room)) return;
      this.error = undefined
      
      const data = {
        room: this.room,
        username: this.username
      }

      try {
        let response = await this.$http.post(`http://${url}/auth/login`, data)
        if (response.body.code === 400 || response.body.code === 401 || response.body.code === 500) {
          this.error = response.body.message
          return 
        }
        this.$store.dispatch(STORE_ACTIONS.joinRoom, data)
        this.$router.push("/chat")
      } catch (error) {
        this.error = this.defaultError
        console.log(error)
      }
    }
  }
};
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
