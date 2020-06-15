<template>
  <div class="video">
    <div class="video__spinner">
      <md-progress-spinner 
        v-if="!videoStream" 
        class="md-accent" 
        md-mode="indeterminate">
      </md-progress-spinner>
     </div>

    <AudioVideoControls 
        v-if="displayControls" 
        :pauseVideo="pauseVideo" 
        :pauseAudio="pauseAudio">
    </AudioVideoControls>
    <video  
        :id="videoId"      
        autoplay="true"
        muted="muted"
        v-if="muted">
    </video>
    <video  
        :id="videoId" 
        autoplay="true"
        v-if="!muted">
    </video>
  </div>
</template>

<script>
import AudioVideoControls from "./AudioVideoControls"

export default {
  name: "Video",
  components: {
    AudioVideoControls
  },
  props: {
      videoId: String,
      displayControls: Boolean,
      videoStream: MediaStream,
      pauseVideo: Function,
      pauseAudio: Function,
      muted: Boolean
  }
}
</script>

<style lang="scss" scoped>
.video {
  background-color: #353535;
  height: 100%;
  position: relative;
  &__spinner {
    position: absolute;
    width: 100%;
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: center;
  }
  video {
    width: 100%;
    height: 100%;
  }
}
</style>