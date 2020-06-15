<template>
  <div class="controls">
    <span
      @click="swapVideo()"
      class="material-icons"
      :class="{ disabled: !videoOn }"
    >{{ videoOn ? 'videocam' : 'videocam_off'}}</span>
    <span
      @click="swapAudio()"
      class="material-icons"
      :class="{ disabled: !audioOn }"
    >{{ audioOn ? 'mic' : 'mic_off'}}</span>
  </div>
</template>

<script>
export default {
  name: "AudioVideoControls",
  props: {
    pauseVideo: Function,
    pauseAudio: Function
  },
  data: () => ({
    videoOn: true,
    audioOn: true
  }),
  methods: {
    swapVideo() {
      this.videoOn = !this.videoOn
      this.pauseVideo()
    },
    swapAudio() {
      this.audioOn = !this.audioOn
      this.pauseAudio()
    }
  }
}
</script>

<style lang="scss" scoped>
.controls {
  position: absolute;
  bottom: 0;
  display: flex;
  width: 100%;
  justify-content: center;
  span {
    &:hover {
      background: #717171;
    }
    border: solid 1px white;
    border-radius: 17px;
    padding: 4px;
    z-index: 2;
    bottom: 0;
    display: block;
    color: white;
    margin: 0 5px 5px 5px;
    cursor: pointer;

    &.disabled {
      background-color: red;
      border: solid 1px red;
      &:hover {
        background-color: red;
      }
    }
  }
}
</style>