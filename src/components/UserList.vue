<template>
  <md-list>
    <md-toolbar class="md-transparent" md-elevation="0">Users connected</md-toolbar>
    <div v-for="user in users" v-bind:key="user.username">
      <md-list-item>
        <md-icon>face</md-icon>
        <span class="md-list-item-text">{{user.username}}</span>
        <md-button
          class="md-icon-button md-list-action"
          v-if="$store.state.username !== user.username"
          v-on:click="openChat(user.username)"
          :disabled="openPrivateChat === true">
        <md-icon class="md-primary" >chat_bubble</md-icon>
        </md-button>
      </md-list-item>
    </div>
  </md-list>
</template>


<script>
export default {
  name: "UserList",
  props: {
    users: Array,
    openPrivateChat: Boolean
  },
  created() {},
  methods: {
    openChat(user) {
      this.$emit("open-chat", user);
    }
  }
};
</script>
