<template>
  <div>
    <md-dialog
      :md-active.sync="showDialog"
      :md-fullscreen="false"
      :md-click-outside-to-close="false"
    >
      <div>
        <md-button class="md-icon-button" v-on:click="closeChat()">
          <md-icon>close</md-icon>
        </md-button>
      </div>
      <md-dialog-content>whateverrr</md-dialog-content>
<!-- 
      <md-dialog-actions>
        <md-button class="md-primary" @click="showDialog = false">Close</md-button>
        <md-button class="md-primary" @click="showDialog = false">Save</md-button>
      </md-dialog-actions> -->
    </md-dialog>
  </div>
</template>


<script>
export default {
  name: "ChatDialog",
  props: {
    showDialog: Boolean
  },
  data: function() {
    return {
    };
  },
  created() {},
  methods: {
    closeChat(){
      this.$emit('close-chat')
    }
  }
};
</script>

<style lang="scss" scoped>
button {
  float: right;
}
</style>

