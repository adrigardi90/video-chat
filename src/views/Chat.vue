<template>
  <div class="page-container">
    <div class="chat">

      <div class="md-layout-item">
        <md-field>
          <label for="room">Room</label>
          <md-select v-model="room" @md-selected="onChangeRoom" name="room" id="room">
            <md-option
              v-for="room in this.$store.state.rooms"
              :key="room.id"
              :value="room.name"
            >{{room.name}}</md-option>
          </md-select>
        </md-field>
      </div>

      <md-app md-waterfall md-mode="fixed">
        <md-app-toolbar class="md-primary">
          <span class="md-title page-container__room">{{room}}</span>
          <md-button 
            class="md-icon-button page-container-logout"  
            :disabled="openPrivateChat.chat"
            @click.native="toggleConference()">
            <md-icon>{{!conference.open ? 'group' : 'close'}}</md-icon>
          </md-button>
          <md-button class="md-icon-button page-container-logout" @click.native="logout()">
            <md-icon>power_settings_new</md-icon>
          </md-button>
        </md-app-toolbar>

        <md-app-drawer md-permanent="full">
          <UserList
            :users="users"
            :openPrivateChat="openPrivateChat.chat || conference.open"
            @open-chat="openChat($event)"
          ></UserList>
        </md-app-drawer>

        <md-app-content id="chat-content">
          <ChatArea 
            :messages="messages"
            :maxMessageLength="120"
            :chatContainer="'md-app-scroller'">
          </ChatArea>
        </md-app-content>
      </md-app>

      <MessageArea 
        @send-message="sendMessage($event)">
      </MessageArea>

      <ChatDialog 
        :v-if="openPrivateChat.chat"
        :showDialog="openPrivateChat" 
        @close-chat="closePrivateChat()">
      </ChatDialog>
    </div>
    <div class="conference">
      <Conference
        v-if="conference.open" 
        :users="users"
        :conference="conference">
      </Conference>
    </div>
  </div>
</template>

<script>
import UserList from "./../components/UserList"
import ChatArea from "./../components/ChatArea"
import MessageArea from "./../components/MessageArea"
import ChatDialog from "./../components/ChatDialog"
import Conference from "./../components/conference/Conference"
import { STORE_ACTIONS, WS_EVENTS, DESCRIPTION_TYPE } from "./../utils/config"

export default {
  name: "chat",
  components: {
    UserList,
    ChatArea,
    MessageArea,
    ChatDialog,
    Conference
  },
  sockets: {
    newUser: function({users, username}) {
      const isMe = this.$store.state.username === username
      if (users.length > this.users.length) {
        this.messages.push({join: true, msg:`${!isMe ? username : 'You'} joined the room`})
      } else if(users.length < this.users.length) {
        this.messages.push({join: true, msg:`${username} left the room`})
      }
      this.users = [...users]
    },

    newMessage: function({ message, username }) {
      const isMe = this.$store.state.username === username
      const msg = isMe ? ` ${message}` : {username, message}
      this.messages.push({ msg, isMe })
    },

    privateChat: function({ to, from }) {
      if (this.$store.state.username !== to || this.openPrivateChat.chat) return
      //Open chat when the other peer opens it
      this.openPrivateChat = { ...this.openPrivateChat,
        chat: true,
        user: from,
        room: to
      }
    },

    privateMessage: function({ privateMessage, to, from }) {
      const isObj = typeof privateMessage === "object"
      const isFromMe = this.$store.state.username === from
      if (isObj && isFromMe) return

      this.openPrivateChat.msg.push({
        msg: isObj ? privateMessage.msg : privateMessage,
        isMe: this.$store.state.username !== to
      })
    },

    leavePrivateRoom: function({ privateMessage }) {
      if (this.openPrivateChat.closed) return
      this.openPrivateChat.msg.push({ msg: privateMessage })
      this.openPrivateChat = { ...this.openPrivateChat, closed: true }
    },

    leaveChat: function({ users, message }) {
      this.messages.push({join: true, msg: message})
      this.users = [...users]
    },

    PCSignalingConference: function({ desc, from, to, candidate }) {
      if (from === this.$store.state.username || (!!to && to !== this.$store.state.username)) return

      if (desc) {
        if (desc.type === DESCRIPTION_TYPE.offer) 
          this.conference = { ...this.conference, offer: { from, desc }, open: true }
        else if (desc.type === DESCRIPTION_TYPE.answer) 
          this.conference = { ...this.conference, answer: { from, desc } }
      } else if (candidate) {
        this.conference = { ...this.conference, candidate: { from, candidate } }
      } 
    },

    conferenceInvitation: function({ to, from, message}) {
      if (message && this.$store.state.username === from) return this.$toastr.w(message)
      if (this.$store.state.username !== to) return
      
      this.conference.room = from
      this.$socket.emit(WS_EVENTS.joinConference, { ...this.$store.state,
        to: from,
        from: this.$store.state.username
      })
    },

    joinConference: function({ from }) {
      if (this.$store.state.username === from ) return
      this.conference = { ...this.conference, user: from, userLeft: null }   
    },

    leaveConference: function({ from }) {
     from === this.conference.room 
          ? this.conference = {} 
          : this.conference = {...this.conference, userLeft: from, user: null }
    }
  },
  beforeCreate: function() {
    this.$socket.emit(WS_EVENTS.joinRoom, this.$store.state)
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
      },
      conference: {
        admin: false,
        user: '',
        room: '',
        offer: null,
        answer: null,
        candidate: null,
        open: false,
        userLeft: ''
      }
    }
  },
  methods: {
    onChangeRoom(val) {
      if (this.room === val) return
      this.$socket.emit(WS_EVENTS.leaveRoom, this.$store.state)
      this.$store.dispatch(STORE_ACTIONS.changeRoom, val)
      this.messages.length = 0
      this.$socket.emit(WS_EVENTS.joinRoom, this.$store.state)
    },
    sendMessage(msg) {
      this.$socket.emit(WS_EVENTS.publicMessage, { ...this.$store.state, message: msg })
    },
    openChat(user) {
      this.openPrivateChat = { ...this.openPrivateChat,
        chat: true,
        user: user,
        room: user // The room is the username talking to
      }
    },
    closePrivateChat() {
      this.openPrivateChat = { ...this.openPrivateChat,
        chat: false,
        closed: false,
        user: null,
        msg: [],
        room: null
      }
    },
    async logout() {
      try {
        this.$socket.emit(WS_EVENTS.leaveChat, {
          room: this.room,
          username: this.$store.state.username
        })
        await this.$store.dispatch(STORE_ACTIONS.leaveChat, this.$store.state.username)
        this.$socket.close()
        this.$router.push("/")
      } catch (error) {
        console.log(error)
      }
    },
    toggleConference() {
      !this.conference.open 
        ? this.conference = {...this.conference, open: true, admin: true, room: this.$store.state.username}
        : this.conference = {}
    },
  }
}
</script>



<style lang="scss">
@import "./../styles/variables";

.page-container {
  display: flex;
  height: 100%;
  background: url("./../assets/bck.jpg");
  background-size: 100% 100%;

  .chat {
    flex:1
  }

  .md-field {
    width: 200px;
    margin: 0 auto;
    margin-bottom: 3rem;

    & label {
      color: white;
    }

    & .md-icon-image svg{
      fill: white;
    }

    & .md-menu.md-select {
      border-bottom: 1px solid white;
    }

    &.md-theme-default.md-has-value .md-input {
      -webkit-text-fill-color: white !important;
    }
    .md-menu.md-select .md-input {
      -webkit-text-fill-color: white !important;
    }
  }

  .md-toolbar.md-theme-default {
    &.md-transparent {
      background: $secondary_blue;
      color: white;
      font-size: 17px;
    }

    &.md-primary {
      background-color: $main_blue;

      & .md-title {
        font-weight: bold;
      }

      & .md-icon {
        font-weight: bold;
      }
    }
  }

  .md-layout-item {
    padding-top: 2rem;
  }

  .md-app {
    width: 85%;
    margin: 0 auto;
    height: 70vh;
    max-width: 1300px;

    & .md-content.md-theme-default {
      background: url("./../assets/msg_bck.png");
      background-attachment: fixed;
      background-size: 100% 100%;
      border-left: 0;
    }

    & .md-layout-column.md-flex.md-theme-default.md-scrollbar{
        background: url("./../assets/msg_bck.png");
        background-attachment: fixed;
        background-size: 100% 100%;
    }

    &.md-fixed .md-app-scroller{
      background: url("./../assets/msg_bck.png");
      background-attachment: fixed;
      background-size: 100% 100%;
      border-left: 1px solid rgba(0,0,0,0.12);
    }
  }

  .md-app-toolbar {
    display: block;
  }

  .md-drawer {
    width: 195px;
    @media screen and (min-width: 700px) {
      width: 270px;
    }
  }

  &__room {
    float: left;
    padding-top: 19px;
  }
  &-logout {
    float: right;
    margin-top: 12px;
  }
}
</style>


