<template>
  <div class="message">
    <div v-for="msg in messages" :key="msg.msg" class="message__container">
      <p
        class="message__text"
        :class="{ own: msg.isMe, other: !msg.isMe}"
        v-message="msg.msg"
      ></p>
    </div>
  </div>
</template>


<script>
export default {
  name: "ChatArea",
  props: {
    messages: Array
  },
  directives: {
    message: {
      bind: function(el, binding) {
        const isObj = typeof binding.value === 'object'
        isObj ? 
          el.innerHTML = `<span style="font-weight:bold">${binding.value.username}</span>: ${binding.value.message}`:
          el.innerHTML = `<span>${binding.value}</span>`
      }
    }
  },
  created() {}
};
</script>

<style lang="scss" scoped>
.message {
  &__text {
    width: max-content;
    padding: 0px 7px;
    border-radius: 10px;
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

