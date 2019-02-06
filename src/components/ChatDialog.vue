<template>
  <div>
    <md-dialog
      :md-active.sync="showDialog"
      :md-fullscreen="false"
      :md-click-outside-to-close="false"
    >
      <div>
        <md-avatar class="md-avatar-icon md-primary">
          <md-icon>folder</md-icon>
        </md-avatar>
      </div>
      <md-dialog-content>whateverrr</md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="showDialog = false">Close</md-button>
        <md-button class="md-primary" @click="showDialog = false">Save</md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-button class="md-primary md-raised" @click="showDialog = true">Show Dialog</md-button>
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
  created() {}
};
</script>

<style lang="scss" scoped>
.md-overlay {
    position: absolute !important;
}
</style>

