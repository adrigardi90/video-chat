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
          :users="users"
          :openPrivateChat="openPrivateChat.chat"
          @open-chat="openChat($event)"
        ></UserList>
      </md-app-drawer>

      <md-app-content>
        <ChatArea :messages="messages"></ChatArea>
      </md-app-content>
    </md-app>

    <MessageArea @send-message="sendMessage($event)"></MessageArea>

    <ChatDialog :showDialog="openPrivateChat" @close-chat="closePrivateChat()"></ChatDialog>
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
      const msg = isMe ? ` ${message}`: `${username.toUpperCase()} - ${message} `;
      const msgObj = { msg, isMe };
      this.messages.push(msgObj);
    },

    privateChat: function({ username, to }) {
      const isMe = this.$store.state.username === to;
      if (isMe && !this.openPrivateChat.chat) {
        // Join private room
        this.$socket.emit("joinPrivateRoom", {
          to: this.$store.state.username,
          room: null,
          username
        });
      }
    },

    privateMessage: function({ privateMessage, to, from, room }) {
      console.log(`New private message from ${from} in the room ${room}`);

      // Open private chat with the info
      if (!this.openPrivateChat.chat) {
        this.openPrivateChat = {
          ...this.openPrivateChat,
          chat: true,
          user: from,
          room: room
        };
      }
      // else if (
      //   this.openPrivateChat.chat &&
      //   this.$store.state.username !== to &&
      //   this.openPrivateChat.room !== room &&
      //   this.openPrivateChat.room !== from
      // ) {
      //   console.log("talking with someone else");

      //   return;
      // }

      const isMe = this.$store.state.username === to;
      const msgObj = {
        msg: privateMessage,
        isMe: !isMe
      };
      this.openPrivateChat.msg.push(msgObj);
    },

    leavePrivateRoom: function({ privateMessage, to, from, room }) {
      if (from === this.openPrivateChat.user) {
        this.openPrivateChat.msg.push({
          msg: privateMessage
        });
        this.openPrivateChat = {
          ...this.openPrivateChat,
          closed: true
        };
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
        user: null,
        msg: [],
        room: null,
        closed: false
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
        ...this.openPrivateChat,
        chat: true,
        user: user,
        room: user // The room is the username who talk with
      };
    },
    closePrivateChat() {
      // leavePrivate room emit
      this.$socket.emit("leavePrivateRoom", {
        room: this.openPrivateChat.room,
        to: this.openPrivateChat.room,
        from: this.$store.state.username
      });

      this.openPrivateChat = {
        ...this.openPrivateChat,
        chat: false,
        closed: false,
        user: null,
        msg: [],
        room: null
      };
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


