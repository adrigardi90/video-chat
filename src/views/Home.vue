<template>
  <div class="options">
    <h2>VIDEO CHAT</h2>
    <div>
      <form novalidate class="md-layout" @submit.prevent="submitForm">
        <md-field>
          <label>Username</label>
          <md-input v-model="username" type="string" id="username"></md-input>
        </md-field>
        <md-field>
          <label for="movie">Room</label>
          <md-select v-model="room" name="room" id="room">
            <md-option  v-for="room in rooms" :key="room.id" :value="room.name">{{room.name}}</md-option>
          </md-select>
        </md-field>
        <div class="options__submit">
          <md-button type="submit" class="md-raised md-primary" :disabled="!(username && room)">JOIN</md-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { url } from "./../utils/config";

export default {
  name: "home",
  components: {},
  data: function() {
    return {
      username: undefined,
      room: undefined,
      rooms: []
    };
  },
  created() {
    this.$http.get(`http://${url}/rooms`).then(
      data => {
        this.rooms = data.body
        this.$store.dispatch("setRooms", this.rooms);
      },
      err => {
        console.log(err)
      }
    );
  },
  methods: {
    submitForm: function() {
      // call login API where the user will be stored and execute
      this.$store.dispatch("joinRoom", {
        room: this.room,
        username: this.username,
      });

      this.$router.push("/chat");
    }
  },
  computed: {
    isEmpty: function() {
      return !(this.username && this.room);
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
  &__submit {
    width: 100%;
  }
}
</style>
