<template>
  <div class="video">
    <div class="video__partner">
      <rotate-square5 v-if="!remoteVideo" class="video__spinner"></rotate-square5>
      <!-- <video v-else id="remoteVideo" class="video__spinner" autoplay :srcObject.prop="remoteVideo"></video> -->
      <video id="remoteVideo" class="video__spinner" autoplay></video>
    </div>
    <!-- <video id="localVideo" class="video__myself" autoplay :sr∂cObject.prop="myVideo"></video> -->
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
    myVideo: undefined,
    remoteVideo: undefined,

    // Media config
    constraints: {
      audio: true,
      video: true
    },

    // local video stream
    localStream: undefined,

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
  // async created() {

  //   this.username = this.$store.state.username

  //   // Peer connection
  //   // this.pc = new RTCPeerConnection(this.configuration);

  //   // this.pc.ontrack = this.onRemoteTrack.bind(this);
  //   // this.onIceCandidates();

  //   // The person who call
  //   if (!this.videoAnswer.video) {
  //     // Handler of negotiationneeded event to create an offer to the other person
  //     // this.listenOnNegotiation();
  //     await this.getUserMedia();
  //     console.log('after')

  //     // The person who get the call
  //   } else {
  //     this.handleAnser();
  //   }
  // },

  async created() {
    this.username = this.$store.state.username;

    // Calling
    if (!this.videoAnswer.video) {
      await this.getUserMedia();
      this.callFriend();

      // Getting the call
    } else {
      await this.getUserMedia();
      this.handleAnser();
    }
  },
  mounted() {
    this.myVideo = document.getElementById("localVideo");
    this.remoteVideo = document.getElementById("remoteVideo");
  },
  methods: {
    // async getUserMedia() {
    //   log('Requesting local video stream');

    //   if ("mediaDevices" in navigator) {
    //     try {
    //       // Get camera/audio access
    //       const stream = await navigator.mediaDevices.getUserMedia(
    //         this.constraints
    //       );

    //       log('Received local video stream')

    //       // Add tracks to the connection
    //       stream.getTracks().forEach(track => this.pc.addTrack(track, stream));

    //       // Add stream to video tag
    //       //this.myVideo = stream;
    //       this.myVideo.srcObject = stream;
    //     } catch (error) {
    //       console.log(`getUserMedia error: ${error}`);
    //     }
    //   }
    // },
    async getUserMedia() {
      log(`Requesting ${this.username} video stream`);

      if ("mediaDevices" in navigator) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(
            this.constraints
          );
          this.myVideo.srcObject = stream;
          this.localStream = stream;
          log("Received local video stream");
        } catch (error) {
          log(`getUserMedia error: ${error}`);
        }
      }
    },
    async callFriend() {
      log(`${this.username} wants to start a call`);
      this.getAudioVideo();
      this.createPeerConnection();
      this.createOffer();
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

    async listenOnNegotiation() {
      this.pc.onnegotiationneeded = async () => {
        try {
          await this.pc.setLocalDescription(await this.pc.createOffer());

          // send the offer to the other peer
          this.$socket.emit("privateMessagePCSignaling", {
            desc: this.pc.localDescription,
            to: this.to,
            from: this.$store.state.username,
            room: this.room
          });
        } catch (err) {
          console.log(`onnegotiationneeded error: ${err}`);
        }
      };
    },
    // async handleAnser() {
    //   await this.pc.setRemoteDescription(this.videoAnswer.remoteDesc);
    //   this.getUserMedia();
    //   await this.pc.setLocalDescription(await this.pc.createAnswer());

    //   // send the asnwer to the other peer
    //   this.$socket.emit("privateMessagePCSignaling", {
    //     desc: this.pc.localDescription,
    //     to: this.to,
    //     from: this.$store.state.username,
    //     room: this.room
    //   });
    // },
    // async handleAnser() {
    //   await this.pc.setRemoteDescription(this.videoAnswer.remoteDesc);
    //   this.getUserMedia();
    //   await this.pc.setLocalDescription(await this.pc.createAnswer());
    //   // send the asnwer to the other peer
    //   this.$socket.emit("privateMessagePCSignaling", {
    //     desc: this.pc.localDescription,
    //     to: this.to,
    //     from: this.$store.state.username,
    //     room: this.room
    //   });
    // },

    async handleAnser() {
      log(`${this.username} gets an offer from ${this.videoAnswer.from}`);
      await this.getAudioVideo();
      this.createPeerConnection();
      await this.setRemoteDescription(this.videoAnswer.remoteDesc);
      this.createAnswer();
    },

    async setRemoteDescription(remoteDesc) {
      try {
        log(`${this.username} setRemoteDescription: start`);
        await this.pc.setRemoteDescription(this.videoAnswer.remoteDesc);
        log(`${this.username} setRemoteDescription: finished`);
      } catch (error) {
        log(`Error setting the RemoteDescription in ${this.username}. Error: ${error}`);
      }
    },

    async addCandidate(candidate) {
      try {
        await this.pc.addIceCandidate(candidate);
      } catch (error) {}
    },
    onRemoteTrack(event) {
      // once media for a remote track arrives, show it in the remote video element
      //this.pc.ontrack = function(event) {
      // don't set srcObject again if it is already set.
      if (this.remoteVideo) return;
      // this.remoteVideo = event.streams[0];
      this.remoteVideo.srcObject = event.streams[0];
      //};
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
    }
  },

  watch: {
    videoAnswer: function(newVal, oldVal) {
      const desc = newVal.remoteDesc;
      const candidate = newVal.candidate;
      if (desc !== undefined && desc !== oldVal.remoteDesc) {
        this.setRemoteDescription(desc);
      }

      if (candidate !== undefined && candidate !== oldVal.candidate) {
        this.addCandidate(candidate);
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

