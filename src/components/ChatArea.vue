<template>
  <div class="message">
    <div v-for="msg in messages" :key="msg.msg" class="message__container">
      <p
        v-if="!msg.join"
        class="message__text"
        :class="{ own: msg.isMe, other: !msg.isMe}"
        v-message="msg.msg"
      ></p>
      <p 
        v-if="msg.join"
        class="message__joined"> 
        {{msg.msg}}</p>
    </div>
  </div>
</template>


<script>
export default {
  name: "ChatArea",
  props: {
    messages: Array,
    maxMessageLength: Number,
    chatContainer: String
  },
  directives: {
    message: {
      bind: function(el, binding, vnode) {
        const isObj = typeof binding.value === 'object'
        let chunks
        const maxLength = vnode.context.maxMessageLength

        if(isObj) {
          chunks = Math.ceil(binding.value.message.length / maxLength)
          el.innerHTML = `<span style="font-weight:bold">${binding.value.username}</span>: 
            ${vnode.context.getChunkText(binding.value.message, maxLength, chunks)}`
        } else {
          chunks = Math.ceil(binding.value.length / maxLength)
          el.innerHTML = vnode.context.getChunkText(binding.value, maxLength, chunks)
        }
      }
    }
  },
  methods: {
    getChunkText(message, maxLength, index){
      let newMessage= ''
      for(let i = 0; i < index; i++){
        const newChunk = message.slice(i*maxLength, maxLength*(i+1))
        if (i!==0) newMessage += '<br>'
        newMessage += `<span> ${newChunk} </span>`
      }
      return newMessage
    }
  },
  watch: {
    messages: function(){
      const chatArea = document.getElementsByClassName(this.chatContainer)[0]
      chatArea.scrollTop = chatArea.scrollHeight + 100
    }
  }
};
</script>

<style lang="scss" scoped>
.message {
  padding-bottom: 2rem;
  &__text {
    width: max-content;
    padding: 0px 7px;
    border-radius: 10px;
  }

  &__joined{
    font-size: 0.9rem;
    font-style: oblique;
    margin: 0 auto;
  }

  &__container {
    width: 100%;
    display: inline-table;
  }

  .own {
    background: #0080001f;
    border: 1px solid #0080001f;
    margin: 0;
    float: right;
  }

  .other {
    background: #d6ca002b;
    border: 1px solid #d6ca002b;
    margin: 0;
    float: left;
  }
}
</style>

