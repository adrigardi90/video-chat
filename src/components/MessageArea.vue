<template>
  <div class="text-area">
    <div class="text-area__input">
      <textarea name id cols="30" rows="10" v-model="message" @keyup.enter="sendMessage()"></textarea>
    </div>
    <div>
      <md-button class="md-primary" @click="sendMessage()">Send</md-button>
    </div>
  </div>
</template>


<script>
export default {
  name: "MessageArea",
  props: {},
  data: function() {
    return {
      message: ""
    };
  },
  methods: {
    sendMessage() {
      const msg = this.message.replace(/\n/g,'')
      this.$emit("send-message", msg);
      this.message = "";
    }
  }
};
</script>


<style lang="scss" scoped>
.text-area {
  width: 85%;
  margin: 0 auto;
  display: flex;
  max-width: 1300px;
  margin-top: 5px;

  &__input {
    width: 100%;
    & textarea {
      width: 100%;
      height: 45px;
      border-color: rgba(0, 0, 0, 0.12);
    }
  } 

  & .md-button.md-theme-default.md-primary {
    background: #3961a5;
    color: white;
  }
}
</style>
