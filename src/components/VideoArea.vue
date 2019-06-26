<template>
  <div class="video">
    <div class="video__partner">
      <rotate-square5 v-if="!remoteStream" class="video__spinner"></rotate-square5>
      <video id="remoteVideo" class="video__spinner" autoplay></video>
    </div>
    <video id="localVideo" class="video__myself" autoplay></video>
  </div>
</template>


<script>
import { RotateSquare5 } from "vue-loading-spinner";
import { servers } from "./../utils/ICEServers";
import { log } from "./../utils/logging";

export default {
  name: "VideoArea",
  props: {
    room: String,
    to: String,
    videoAnswer: Object
  },
  components: {
    RotateSquare5
  },
  data: () => ({
    // videos
    myVideo: {},
    remoteVideo: {},

    // Media config
    constraints: {
      audio: true,
      video: true
    },

    // local & remote video stream
    localStream: undefined,
    remoteStream: undefined,

    // STUN ice servers
    configuration: servers,

    // Peer connection
    pc: undefined,

    // Offer config
    offerOptions: {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    },

    username: ""
  }),
  async created() {
    this.username = this.$store.state.username;
    await this.getUserMedia();
    this.addLocalStream();
    await this.getAudioVideo();

    !this.videoAnswer.video ? 
      this.callFriend() : // Caller
      this.handleAnser() // Callee
  },
  mounted() {
    this.myVideo = document.getElementById("localVideo");
    this.remoteVideo = document.getElementById("remoteVideo");
  },
  methods: {
    async callFriend() {
      log(`${this.username} wants to start a call`);   
      this.createPeerConnection();    
      // Event listeners
      this.onIceCandidates();
      this.onAddStream();

      await this.createOffer();
    },
    async handleAnser() {
      log(`${this.username} gets an offer from ${this.videoAnswer.from}`);
      this.createPeerConnection();

      // Event listeners
      this.onIceCandidates();
      this.onAddStream();

      await this.setRemoteDescription(this.videoAnswer.remoteDesc);
      this.createAnswer();
    },
    async getUserMedia() {
      log(`Requesting ${this.username} video stream`);

      if ("mediaDevices" in navigator) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(this.constraints);
          this.myVideo.srcObject = stream;
          this.localStream = stream;
          log("Received local video stream");
        } catch (error) {
          log(`getUserMedia error: ${error}`);
        }
      }
    },

    getAudioVideo() {
      const video = this.localStream.getVideoTracks();
      const audio = this.localStream.getAudioTracks();

      if (video.length > 0) log(`Using video device: ${video[0].label}`);
      if (audio.length > 0) log(`Using audio device: ${audio[0].label}`);
    },

    createPeerConnection() {
      this.pc = new RTCPeerConnection(this.configuration);
      log(`Created ${this.username} peer connection object`);
    },

    async createOffer() {
      log(`${this.username} create an offer: start`);
      try {
        const offer = await this.pc.createOffer(this.offerOptions);
        log(`Offer from ${this.username}\n ${offer.sdp}`);

        log(`${this.username} setLocalDescription: start`);
        await this.pc.setLocalDescription(offer);
        log(`${this.username} setLocalDescription: finished`);

        this.sendSignalingMessage(this.pc.localDescription, true);
      } catch (error) {
        log(`Error creating the offer from ${this.username}. Error: ${error}`);
      }
    },

    async createAnswer() {
      log(`${this.username} create an answer: start`);
      try {
        const answer = await this.pc.createAnswer();
        log(`Answer from ${this.username}\n ${answer.sdp}`);

        log(`${this.username} setLocalDescription: start`);
        await this.pc.setLocalDescription(answer);
        log(`${this.username} setLocalDescription: finished`);

        this.sendSignalingMessage(this.pc.localDescription, false);
      } catch (error) {
        log(`Error creating the answer from ${this.username}. Error: ${error}`);
      }
    },

    sendSignalingMessage(desc, offer) {
      const isOffer = offer ? "offer" : "answer";
      log(`${this.username} sends the ${isOffer} through the signal channel`);
      // send the offer to the other peer
      this.$socket.emit("privateMessagePCSignaling", {
        desc: desc,
        to: this.to,
        from: this.$store.state.username,
        room: this.room
      });
    },

    async setRemoteDescription(remoteDesc) {
      try {
        log(`${this.username} setRemoteDescription: start`);
        await this.pc.setRemoteDescription(remoteDesc);
        log(`${this.username} setRemoteDescription: finished`);
      } catch (error) {
        log(`Error setting the RemoteDescription in ${this.username}. Error: ${error}`
        );
      }
    },

    onIceCandidates() {
      // send any ice candidates to the other peer
      this.pc.onicecandidate = ({ candidate }) => {
        this.$socket.emit("privateMessagePCSignaling", {
          candidate,
          to: this.to,
          from: this.$store.state.username,
          room: this.room
        });
      };
    },

    async addCandidate(candidate) {
      try {
        log(`${this.username} added a candidate`);
        await this.pc.addIceCandidate(candidate);
        log(`Candidate added`);
      } catch (error) {
        log(`Error adding a candidate in ${this.username}. Error: ${error}`)
      }
    },

    onAddStream() {
      this.pc.onaddstream = this.onAddBindStream.bind(this)
    },
    
    onAddBindStream(event){
        if(!this.remoteVideo.srcObject && event.stream){
          this.remoteStream = event.stream
          this.remoteVideo.srcObject = this.remoteStream ;
        }
    },

    addLocalStream(){
      this.pc.addStream(this.localStream)
    },

    resetConnection(){
      this.pc.close();
      this.pc = null;
      //this.localStream.stop();
      this.$emit("closeVideo");
    }
  },

  watch: {
    videoAnswer: function(newVal, oldVal) {
      const desc = newVal.remoteDesc;
      const candidate = newVal.candidate;
      const close = newVal.close;
      if (desc !== undefined && desc !== oldVal.remoteDesc) {
        this.setRemoteDescription(desc);
      }
      if (candidate !== undefined && candidate !== oldVal.candidate) {
        this.addCandidate(candidate);
      }
      if(close && close !== oldVal.close){
        this.resetConnection();
      }
    }
  }
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

