<template>
  <div class="chat-dialog">
    <md-dialog
      :md-active.sync="showDialog.chat"
      :md-fullscreen="false"
      :md-click-outside-to-close="false">
      <div v-if="videoCall" class="chat-dialog__left">
        <VideoArea
          :room="showDialog.room"
          :to="showDialog.user"
          :videoAnswer="videoAnswer"
          @closeVideo="video(false)">
        </VideoArea>
      </div>
      <div class="chat-dialog__right">
        <div class="chat-dialog__options">
          <md-button
            class="md-icon-button chat-dialog__video"
            @click="video(!videoCall)"
            :disabled="showDialog.msg.length === 0">
            <md-icon>{{videoCall ? 'videocam_off' : 'video_call' }}</md-icon>
          </md-button>
          <md-button class="md-icon-button chat-dialog__exit" @click="closeChat()">
            <md-icon>close</md-icon>
          </md-button>
        </div>
        <md-dialog-content>
          <p class="chat-dialog__title">Private chat with {{showDialog.user}}</p>
          <ChatArea 
            :messages="showDialog.msg"
            :maxMessageLength="30"
            :chatContainer="'md-dialog-content'">
          </ChatArea>
        </md-dialog-content>

        <md-dialog-actions>
          <textarea
            class="chat-dialog__text"
            v-model="privateMessage"
            :disabled="showDialog.closed"
            @keyup.enter="sendPrivateMessage(privateMessage)">
          </textarea>
        </md-dialog-actions>
      </div>
    </md-dialog>
  </div>
</template>


<script>
import ChatArea from "./ChatArea"
import VideoArea from "./VideoArea"
import { WS_EVENTS, DESCRIPTION_TYPE } from "./../utils/config"

export default {
  name: "ChatDialog",
  components: {
    ChatArea,
    VideoArea
  },
  props: {
    showDialog: Object
  },
  sockets: {
    privateMessagePCSignaling: function({ desc, from, candidate }) {
      if (from === this.$store.state.username) return

      if (desc) {
        if (desc.type === DESCRIPTION_TYPE.offer) { // If we have an income call
          this.openChat(desc, from)
        } else if (desc.type === DESCRIPTION_TYPE.answer) { // If we have a response
          this.videoAnswer = { ...this.videoAnswer, remoteDesc: desc }
        } else {
          console.log("Unsupported SDP type")
        }
      // Candidate
      } else if (candidate) {
        this.videoAnswer = { ...this.videoAnswer, candidate }
      // Other peer has closed the video
      } else {
        this.videoCall = false
      }
    }
  },
  data: function() {
    return {
      privateMessage: "",
      videoCall: false,
      videoAnswer: {
        video: undefined,
        remoteDesc: undefined,
        candidate: undefined,
        close: false
      }
    }
  },
  methods: {
    closeChat() {
      this.videoCall = false
      this.$socket.emit(WS_EVENTS.leavePrivateRoom, {
        room: this.$store.state.room,
        to: this.showDialog.room,
        from: this.$store.state.username
      })
      this.$emit("close-chat")
    },
    openChat(description, from){
      this.videoAnswer = { ...this.videoAnser, video: true, remoteDesc: description, from }
      this.videoCall = true
    },
    sendPrivateMessage(msg) {
      // Do not send empty messages
      if(typeof msg !== "object" && this.privateMessage.replace(/\s/g, "").length === 0) return

      this.$socket.emit(WS_EVENTS.privateMessage, {
        privateMessage: msg,
        to: this.showDialog.user,
        from: this.$store.state.username,
        room: this.showDialog.room
      })
      this.privateMessage = ""
    },
    video(value) {
      this.videoCall = value
      if (value) this.videoAnswer = { ...this.videoAnswer, video: !value }
      else this.sendPrivateMessage({msg:`${this.$store.state.username} has closed the video`})
    },
  },
  watch: {
    showDialog: function({ chat }, oldVal) {
      if (chat && chat !== oldVal.chat ) {
        // Peer openning private chat
        if (this.showDialog.room !== this.$store.state.username){
            this.$socket.emit(WS_EVENTS.joinPrivateRoom, {
              ...this.$store.state,
              to: this.showDialog.user,
              from: this.$store.state.username,
            })
        }
        // Peer receiving a private chat request
        if (this.showDialog.room === this.$store.state.username) {
          this.$socket.emit(WS_EVENTS.joinPrivateRoom, {
            ...this.$store.state,
            // to: this.showDialog.user, 
            to: this.$store.state.username, 
            from: this.$store.state.username,
            joinConfirmation: true
          })
        }
      }
    }
  }
}
</script>



<style lang="scss" scoped>
button {
  float: right;
}

.chat-dialog {
  &__text {
    width: 100%;
    height: 60px;
    border: 1px solid #8080804a;
  }
  &__title {
    text-align: center;
    font-size: 0.9rem;
    font-style: oblique;
  }

  &__options {
    background: #00800073;
  }

  &__video {
    float: left;
  }

  &__exit {
    float: right;
  }

  &__right {
    display: flex;
    flex-flow: column;
    flex: 1;
    width: 300px;

    .md-dialog-content{
      padding-bottom: 2rem;
    }
  }

  &__left {
    width: 450px;
  }
}
</style>

