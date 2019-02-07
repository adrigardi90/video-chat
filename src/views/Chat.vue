<template>
  <div class="page-container">
    <div class="md-layout-item">
      <md-field>
        <label for="room">Room</label>
        <md-select v-model="room" @md-selected="onChangeRoom" name="room" id="room">
          <md-option value="general">General</md-option>
          <md-option value="sports">Sports</md-option>
        </md-select>
      </md-field>
    </div>

    <md-app md-waterfall md-mode="fixed">
      <md-app-toolbar class="md-primary">
        <span class="md-title">{{room}}</span>
      </md-app-toolbar>

      <md-app-drawer md-permanent="full">
        <UserList
          v-bind:users="users"
          v-bind:openPrivateChat="openPrivateChat.chat"
          v-on:open-chat="openChat($event)"
        ></UserList>
      </md-app-drawer>

      <md-app-content>
        <ChatArea v-bind:messages="messages"></ChatArea>
      </md-app-content>
    </md-app>

    <MessageArea v-on:send-message="sendMessage($event)"></MessageArea>

    <ChatDialog v-bind:showDialog="openPrivateChat" v-on:close-chat="openPrivateChat.chat = false"></ChatDialog>
  </div>
</template>

<script>
import UserList from "./../components/UserList";
import ChatArea from "./../components/ChatArea";
import MessageArea from "./../components/MessageArea";
import ChatDialog from "./../components/ChatDialog";

export default {
  name: "chat",
  components: {
    UserList,
    ChatArea,
    MessageArea,
    ChatDialog
  },
  sockets: {
    newUser: function(data) {
      this.users.length = 0;
      this.users = data;
    },
    newMessage: function({ message, username }) {
      const isMe = this.$store.state.username === username;
      const msg = isMe
        ? ` ${message}`
        : `${username.toUpperCase()} - ${message} `;
      const msgObj = {
        msg,
        own: isMe
      };
      this.messages.push(msgObj);
    },
    privateChat: function({ username, to }) {
      const isMe = this.$store.state.username === to;
      if (isMe && !this.openPrivateChat.chat) {

        // Join private room
        this.$socket.emit("joinPrivateRoom", {
          to: this.$store.state.username,
          room: this.$store.state.room,
          username
        });

        // open dialog
        this.openPrivateChat.chat = true
        this.openPrivateChat.user = username

      }
    }
  },
  beforeCreate: function() {
    this.$socket.emit("joinRoom", this.$store.state);
  },
  data: function() {
    return {
      room: this.$store.state.room,
      users: [],
      messages: [],
      openPrivateChat: {
        chat: false,
        user: null
      }
    };
  },
  methods: {
    onChangeRoom(val) {
      if (this.$store.state.room !== val) {
        this.$socket.emit("leaveRoom", this.$store.state);
        this.$store.dispatch("changeRoom", val);
        this.messages.length = 0;
        this.$socket.emit("joinRoom", this.$store.state);
      }
    },
    sendMessage(msg) {
      this.$socket.emit("publicMessage", {
        ...this.$store.state,
        message: msg
      });
    },
    openChat(user) {
      this.openPrivateChat = {
        chat: true,
        user: user
      };
      console.log(user);
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
    max-width: 1300px;
  }

  .md-drawer {
    width: 270px;
  }
}
</style>


