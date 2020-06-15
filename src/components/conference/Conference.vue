<template>
<div class="conference-container">
    <div class="conference-container__header">
      <h3>Private conference (up to 3)</h3>
      <md-menu>
        <md-button 
          class="md-icon-button page-container-logout" 
          md-menu-trigger
          :disabled="peersLength === 2 || users.length === 1"
          v-if="conference.admin">
          <md-icon>group_add</md-icon>
        </md-button>
        <md-menu-content>
          <div v-for="user in users" :key="user.username">
            <md-menu-item 
              v-if="user.username !== $store.state.username && !peers[user.username]" 
              @click="invitate(user.username)">
                <md-icon>person_add</md-icon>
                <span>{{user.username}}</span>
            </md-menu-item>
          </div>
        </md-menu-content>
      </md-menu>
    </div>

    <div class="conference-container__videos">
      <div class="video">
        <Video
          videoId="localVideo"
          :displayControls="true"
          :videoStream="localStream"
          :pauseVideo="pauseVideo"
          :pauseAudio="pauseAudio"
          :muted="true">
        </Video>
      </div>
      <div class="conference-container__videos--remote">
        <div v-for="(item, key) in peers" :key="key" class="video">
            <Video
              :videoId="key"
              :displayControls="false"
              :videoStream="peers[key].peerStream"
              :muted="false">
            </Video>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { WS_EVENTS } from '../../utils/config'
import { videoConfiguration } from './../../mixins/WebRTC'
import Video from './../video/Video'

export default {
  name: "Conference",
  props: {
    conference: Object,
    users: Array
  },
  mixins:[videoConfiguration],
  components: { Video },
  data: () => ({
    peers: {},
    peersLength: 0
  }),
  async mounted() {
    this.myVideo = document.getElementById("localVideo")
    // Admin join the room
    if (this.conference.admin) {
      await this.getUserMedia()
      this.$socket.emit(WS_EVENTS.joinConference, { ...this.$store.state,
        to: this.username
      })
    }
    // Offer
    if(this.conference.offer) {
      const { offer: { from, desc } } = this.conference
      this.init(from, desc)
    }
  },
  beforeDestroy() {
    Object.values(this.peers).forEach(peer => peer.pc.close())
    this.peers = {}
    this.$socket.emit(WS_EVENTS.leaveConference, {  ...this.$store.state,
      from: this.username,
      conferenceRoom: this.conference.room
    })
  },
  methods: {
    async init(offer, desc) {
      await this.getUserMedia()
      this.initWebRTC(offer, desc)
    },
    invitate(user) {
      this.$socket.emit(WS_EVENTS.conferenceInvitation, {
        room: this.$store.state.room,
        to: user,
        from: this.username
      })
    },
    initWebRTC(user, desc) {
      // Add user
      this.$set(this.peers, user, {
        username: user,
        pc: new RTCPeerConnection(this.configuration),
        peerStream: undefined,
        peerVideo: undefined
      })
      this.addLocalStream(this.peers[user].pc)
      this.onIceCandidates(this.peers[user].pc, user, this.conference.room, true)
      this.onAddStream(this.peers[user], user)

      // Act accordingly
      desc 
        ? this.handleAnswer(desc, this.peers[user].pc, user, this.conference.room, true)
        : this.createOffer(this.peers[user].pc, user, this.conference.room, true)
    },
  },
  watch: {
    conference: function({ user, answer, candidate, userLeft, offer }, oldVal) {
      if(userLeft && userLeft !== oldVal.userLeft) {
        this.peersLength--
        this.peers[userLeft].pc.close()
        delete this.peers[userLeft]
      }
      // New user
      if(user && user !== oldVal.user) {
        this.initWebRTC(user)
        this.peersLength++
      }
      // Handle answer
      if(answer && oldVal.answer !== answer) 
        this.setRemoteDescription(answer.desc, this.peers[answer.from].pc)
      // Add candidate
      if (candidate && oldVal.candidate !== candidate) 
        this.addCandidate(this.peers[candidate.from].pc, candidate.candidate)
      // New offer
      if(offer && offer !== oldVal.offer && oldVal.offer !== undefined){
        const { from, desc } = offer
        this.init(from, desc)
      }

    }
  }
}
</script>

<style lang="scss" scoped>
@import "./../../styles/variables";

.conference-container {
  background-color: black;
  height: 100%;
  width: 400px;
  &__header {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 50px;
    background-color: $main_blue;
    .md-button {
      transform: translateY(7px);
    }
    .md-icon.md-theme-default.md-icon-font {
      color: white;
    }
  }
  &__videos {
    position: relative;
    border: solid 1px #ffffff78;
    &--remote{
      position: relative;
    }
  }
  .video {
    width: 100%;
    height: 250px;
  }
  h3 {
    padding-left: 1rem;
    color: white;
  }
}
</style>