<template>
  <md-list class="user-list">
    <md-toolbar class="md-transparent" md-elevation="0">
      <div class="user-list__header">
        <span class="user-list__title">Users connected</span>
        <span class="user-list__status">
          <md-icon @click.native="changeStatus()" v-bind:class="myStatus">fiber_manual_record</md-icon>
        </span>
      </div>
    </md-toolbar>
    <div>
      <div v-for="user in users" :key="user.username">
        <md-list-item>
          <md-icon v-bind:class="user.status">fiber_manual_record</md-icon>
          <span class="md-list-item-text user-list__username">{{user.username}}</span>
          <md-button
            class="md-icon-button md-list-action"
            v-if="$store.state.username !== user.username"
            @click="openChat(user.username)"
            :disabled="openPrivateChat === true">
            <md-icon class="md-primary">chat_bubble</md-icon>
          </md-button>
        </md-list-item>
      </div>
    </div>
  </md-list>
</template>


<script>
import { STORE_ACTIONS, STATUS_OPTIONS, WS_EVENTS } from "./../utils/config";

export default {
  name: "UserList",
  props: {
    users: Array,
    openPrivateChat: Boolean
  },
  data: function() {
    return {
      status: {
        available_status: "#05b105",
        absent_status: "#f7bb04",
        unavailable_status: "#bb0000"
      }
    };
  },
  created() {},
  methods: {
    openChat(user) {
      this.$emit("open-chat", user);
    },
    changeStatus() {
      this.$store.dispatch(STORE_ACTIONS.changeStatus).then( ()=> {
        this.$socket.emit(WS_EVENTS.changeStatus, this.$store.state);
      });
    }
  },
  computed: {
    myStatus: function() {
      return {
        available: this.$store.state.status === STATUS_OPTIONS.available,
        absent: this.$store.state.status === STATUS_OPTIONS.absent,
        unavailable: this.$store.state.status === STATUS_OPTIONS.unavailable
      };
    }
  }
};
</script>

<style lang="scss" scoped>
@import "./../styles/variables";

.user-list {
  &__header{
    width: 100%;
  }
  &__title {
    float: left;
  }
  &__status {
    float: right;
    margin-right: -8px;
  }
  &__username{
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
  }
  .available {
    color: $available_status !important;
  }
  .absent {
    color: $absent_status !important;
  }
  .unavailable {
    color: $unavailable_status !important;
  }
}
.md-icon.md-theme-default.md-icon-font {
  font-size: 15px !important;
  margin-right: 15px;
  cursor: pointer;
  &.md-primary {
    color: #3961a5;
    font-size: 20px !important;
    margin-right: unset;
  }
}
.md-toolbar.md-theme-default.md-transparent {
  background: #486ca9;
  color: white;
  font-size: 17px;
  position: sticky;
  top: 0px;
  z-index: 9;
}

.md-button.md-theme-default{
  margin: 0 -10px 0 5px;
}
</style>

