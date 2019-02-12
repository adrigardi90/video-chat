<template>
  <div class="chat-dialog">
    <md-dialog
      :md-active.sync="showDialog.chat"
      :md-fullscreen="false"
      :md-click-outside-to-close="false"
    >
    <div v-if="videoCall" class="chat-dialog__left">
      <VideoArea></VideoArea>
    </div>
    <div class="chat-dialog__right">
      <div class="chat-dialog__options">
        <md-button 
            class="md-icon-button chat-dialog__video" 
            v-on:click="videoCall = true" 
            :disabled="showDialog.msg.length === 0">
          <md-icon>video_call</md-icon>
        </md-button>
        <md-button class="md-icon-button chat-dialog__exit" v-on:click="closeChat()">
          <md-icon>close</md-icon>
        </md-button>
      </div>
      <md-dialog-content>
        <p class="chat-dialog__title">Private chat with {{showDialog.user}}</p> 
        <ChatArea v-bind:messages="showDialog.msg"></ChatArea>
      </md-dialog-content>

      <md-dialog-actions>
        <textarea
          class="chat-dialog__text"
          v-model="privateMessage"
          :disabled="showDialog.closed"
          v-on:keyup.enter="sendPrivateMessage()"
        ></textarea>
      </md-dialog-actions>

    </div>

    </md-dialog>
  </div>
</template>


<script>
import ChatArea from "./ChatArea";
import VideoArea from './VideoArea'

export default {
  name: "ChatDialog",
  components: {
    ChatArea,
    VideoArea
  },
  props: {
    showDialog: Object,
  },
  data: function() {
    return {
      privateMessage: "",
      videoCall: false
    };
  },
  methods: {
    closeChat() {
      this.$emit("close-chat");
    },
    sendPrivateMessage() {
      console.log(`${this.$store.state.username} want to send a private message to ${this.showDialog.user}`);

      this.$socket.emit("privateMessage", {
        privateMessage: this.privateMessage,
        to: this.showDialog.user,
        from: this.$store.state.username,
        room: this.showDialog.room
      });

      this.privateMessage = "";
    }
  },
  watch: {
    showDialog: function(newVal, oldVal) {
      const val = newVal.chat;
      if (val && val !== oldVal.chat) {
        
        // Open private chat
        this.$socket.emit("joinPrivateRoom", {
          ...this.$store.state,
          to: this.showDialog.user
        });
      }
    }
  }
};
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
  &__title{
    text-align: center;
    font-size: .9rem;
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

  &__right{
        display: flex;
    flex-flow: column;
    flex: 1;
    width: 300px;
  }

  &__left{
    width: 450px;
  }
}
</style>

