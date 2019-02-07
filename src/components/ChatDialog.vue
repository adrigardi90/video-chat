<template>
  <div class="chat-dialog">
    <md-dialog
      :md-active.sync="showDialog.chat"
      :md-fullscreen="false"
      :md-click-outside-to-close="false"
    >
      <div class="chat-dialog__options">
        <md-button class="md-icon-button chat-dialog__video" v-on:click="closeChat()">
          <md-icon>video_call</md-icon>
        </md-button>
        <md-button class="md-icon-button chat-dialog__exit" v-on:click="closeChat()">
          <md-icon>close</md-icon>
        </md-button>
      </div>
      <md-dialog-content>Private chat with {{showDialog.user}}</md-dialog-content>

      <md-dialog-actions>
        <textarea
          class="chat-dialog__text"
          v-model="privateMessage"
          v-on:keyup.enter="sendPrivateMessage()"
        ></textarea>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>


<script>
export default {
  name: "ChatDialog",
  props: {
    showDialog: Object
  },
  data: function() {
    return {
      privateMessage: ""
    };
  },
  methods: {
    closeChat() {
      this.$emit("close-chat");
    },
    sendPrivateMessage() {
      console.log(`${this.$store.state.username} want to send a private message to ${this.showDialog.user}`
      );
    }
  },
  watch: {
    showDialog: function(newVal) {
      if (newVal) {
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

  &__options {
    background: #00800073;
  }

  &__video {
    float: left;
  }

  &__exit {
    float: right;
  }
}
</style>

