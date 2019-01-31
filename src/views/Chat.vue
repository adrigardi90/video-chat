<template>
  <div class="page-container">
    <div class="md-layout-item">
      <md-field>
        <label for="room">Room</label>
        <md-select v-model="room" @md-selected="onChange" name="room" id="room">
          <md-option value="fight-club">Fight Club</md-option>
          <md-option value="godfather">Godfather</md-option>
        </md-select>
      </md-field>
    </div>

    <md-app md-waterfall md-mode="fixed">
      <md-app-toolbar class="md-primary">
        <span class="md-title">{{room}}</span>
      </md-app-toolbar>

      <md-app-drawer md-permanent="full">
        <UserList v-bind:users="users"></UserList>
      </md-app-drawer>

      <md-app-content>
        <ChatArea v-bind:messages="messages"></ChatArea>
      </md-app-content>
    </md-app>
    <div class="text-area">
      <div class="text-area__input">
        <textarea name id cols="30" rows="10"></textarea>
      </div>
      <div>
        <md-button class="md-primary">Send</md-button>
      </div>
    </div>
  </div>
</template>

<script>
import UserList from "./../components/UserList";
import ChatArea from "./../components/ChatArea";

export default {
  name: "chat",
  components: {
    UserList,
    ChatArea
  },
  data: function() {
    return {
      room: this.$store.state.room,
      users: [
        {
          name: "adri",
          id: 1
        },
        {
          name: "adri",
          id: 2
        },
        {
          name: "adri",
          id: 3
        }
      ],
      messages: [
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam, ",
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam, ",
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam, ",
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam, ",
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam, ",
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam, ",
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam, ",
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam, ",
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam, ",
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam, ",
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam, ",
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error quibusdam, "
      ]
    };
  },
  methods: {
    onChange(val) {
      if (this.$store.state.room !== val) {
        this.$store.dispatch("changeRoom", val);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%;
  .md-field {
    width: 200px;
    margin: 2rem auto;
    margin-bottom: 3rem;
  }
  .md-app {
    border: solid 1px rgba(0, 0, 0, 0.12);
    width: 85%;
    margin: 0 auto;
    height: 70vh;
  }

  .md-drawer {
    width: 270px;
  }

  & .text-area {
    width: 85%;
    margin: 0 auto;
    display: flex;
    max-width: 85%;
    margin-top: 1rem;

    &__input {
      width: 100%;
      & textarea {
        width: 100%;
        height: 59px;
        border-color: rgba(0, 0, 0, 0.12);
      }
    }
  }
}
</style>


