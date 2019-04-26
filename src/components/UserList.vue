<template>
  <md-list>
    <md-toolbar class="md-transparent" md-elevation="0">
      <div class="user-list">
        <span class="user-list__title"> Users connected</span>
        <span class="user-list__status"><md-icon>fiber_manual_record</md-icon></span>
      </div>
      </md-toolbar>
    <div v-for="user in users" :key="user.username">
      <md-list-item>
        <md-icon :class="['status-' + user.username]">fiber_manual_record</md-icon>
        <span class="md-list-item-text">{{user.username}}</span>
        <md-button
          class="md-icon-button md-list-action"
          v-if="$store.state.username !== user.username"
          @click="openChat(user.username)"
          :disabled="openPrivateChat === true"
        >
          <md-icon class="md-primary">chat_bubble</md-icon>
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

<style lang="scss" scoped>
.user-list{
  width: 100%;
  &__title{
    float: left
  }
  &__status{
    float: right;
    margin-right: -8px;
  }
}
.md-icon.md-theme-default.md-icon-font {
  color: green;
  font-size: 15px !important;
  margin-right: 15px;
  &.md-primary {
    color: #3961a5;
    font-size: 20px !important;
    margin-right: unset;
  }
}
.md-toolbar.md-theme-default.md-transparent {
  background: #3961a5ed;
  color: white;
  font-size: 17px;
}
</style>

