<template>
  <div class="page-container">
    <div class="md-layout-item">
      <md-field>
        <label for="room">Room</label>
        <md-select v-model="room" @md-selected="onChange" name="room" id="room">
          <md-option value="fight-club">Fight Club</md-option>
          <md-option value="godfather">Godfather</md-option>
        </md-select>
      </md-field>
    </div>

    <md-app md-waterfall md-mode="fixed">
      <md-app-toolbar class="md-primary">
        <span class="md-title">{{room}}</span>
      </md-app-toolbar>

      <md-app-drawer md-permanent="full">
        <UserList v-bind:users="users"></UserList>
      </md-app-drawer>

      <md-app-content>
        <ChatArea v-bind:messages="messages"></ChatArea>
      </md-app-content>
    </md-app>

    <MessageArea v-on:send-message="sendMessage($event)"></MessageArea>
  </div>
</template>

<script>
import UserList from "./../components/UserList";
import ChatArea from "./../components/ChatArea";
import MessageArea from "./../components/MessageArea";

export default {
  name: "chat",
  components: {
    UserList,
    ChatArea,
    MessageArea
  },
  sockets: {
    newUser: function(data) {
      this.users.length = 0;
      this.users = data;
    },
    newMessage: function({message, username}) {
      const msg = `${username}: ${message} `
      this.messages.push(msg)
    }
  },
  beforeCreate: function() {
    this.$socket.emit("joinRoom", this.$store.state);
  },
  data: function() {
    return {
      room: this.$store.state.room,
      users: [],
      messages: []
    };
  },
  methods: {
    onChange(val) {
      if (this.$store.state.room !== val) {
        // add to the changeroom store the socket emit
        this.$store.dispatch("changeRoom", val);
      }
    },
    sendMessage(msg) {
      this.$socket.emit("publicMessage", {
        ...this.$store.state,
        message: msg
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%;
  .md-field {
    width: 200px;
    margin: 2rem auto;
    margin-bottom: 3rem;
  }
  .md-app {
    border: solid 1px rgba(0, 0, 0, 0.12);
    width: 85%;
    margin: 0 auto;
    height: 70vh;
  }

  .md-drawer {
    width: 270px;
  }
}
</style>


