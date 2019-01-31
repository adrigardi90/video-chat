<template>
  <div>
    <p v-for="msg in messages" v-bind:key="msg.msg">{{msg}}</p>
  </div>
</template>


<script>
export default {
  name: "ChatArea",
  props: {
    messages: Array
  },
  created() {
  }
};
</script>
