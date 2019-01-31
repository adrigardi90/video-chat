<template>
  <md-list>
    <md-toolbar class="md-transparent" md-elevation="0">Users connected</md-toolbar>
    <div v-for="user in users" v-bind:key="user.id">
      <md-list-item>
        <md-icon>face</md-icon>
        <span class="md-list-item-text">{{user.name}}</span>
        <md-button class="md-icon-button md-list-action">
          <md-icon class="md-primary">chat_bubble</md-icon>
        </md-button>
      </md-list-item>
    </div>
  </md-list>
</template>


<script>
export default {
  name: 'UserList',
  props: {
    users: Array
  },
  created() {
  }
};
</script>
