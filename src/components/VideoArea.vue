<template>
  <div class="video">
    <div class="video__partner">
      <rotate-square5 class="video__spinner"></rotate-square5>
    </div>
    <video id="myVideo" class="video__myself" autoplay :srcObject.prop="myVideo"></video>
    <!-- <div class="video__myself">myself</div> -->
  </div>
</template>


<script>
import { RotateSquare5 } from "vue-loading-spinner";

export default {
  name: "VideoArea",
  props: {},
  components: {
    RotateSquare5
  },
  data: () => ({
    myVideo: undefined,
    constraints: {
      audio: true,
      video: true
    }
  }),
  async created() {
    if ("mediaDevices" in navigator) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(this.constraints);
        //stream.getTracks().forEach(track => {});
        this.myVideo = stream;
      } catch (error) {
        console.log(error);
      }
    }
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.video {
  position: relative;
  height: 100%;
  &__partner {
    height: 100%;
  }
  &__myself {
    bottom: 0;
    position: absolute;
    float: right;
    right: 0;
    width: 150px;
    height: 100px;
    z-index: 2;
  }
  &__spinner {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>

