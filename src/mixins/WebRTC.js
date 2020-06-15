import { log } from "../utils/logging"
import { servers } from '../utils/ICEServers'
import { WS_EVENTS, DESCRIPTION_TYPE } from '../utils/config'

export const videoConfiguration = {
    data() {
        return {
            // Media config
            constraints: {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false
                },
                video: {
                    width: 400,
                    height: 250
                },
            },
            // TURN/STUN ice servers               
            configuration: servers,
            // Offer config
            offerOptions: {
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1
            },

            // Local video 
            myVideo: undefined,
            localStream: undefined,
            username: ""
        }
    },

    created() {
        this.username = this.$store.state.username
    },
    beforeDestroy() {
        this.localStream.getTracks().forEach(track => track.stop())
    },

    methods: {
        async getUserMedia() {
            log(`Requesting ${this.username} video stream`)

            if ("mediaDevices" in navigator) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia(this.constraints)
                    this.myVideo.srcObject = stream
                    this.myVideo.volume = 0
                    this.localStream = stream
                } catch (error) {
                    log(`getUserMedia error: ${error}`)
                }
            }
        },
        getAudioVideo() {
            const video = this.localStream.getVideoTracks()
            const audio = this.localStream.getAudioTracks()

            if (video.length > 0) log(`Using video device: ${video[0].label}`)
            if (audio.length > 0) log(`Using audio device: ${audio[0].label}`)
        },
        async setRemoteDescription(remoteDesc, pc) {
            try {
                log(`${this.username} setRemoteDescription: start`)
                await pc.setRemoteDescription(remoteDesc)
                log(`${this.username} setRemoteDescription: finished`)
            } catch (error) {
                log(`Error setting the RemoteDescription in ${this.username}. Error: ${error}`)
            }
        },
        async createOffer(pc, to, room, conference = false) {
            log(`${this.username} wants to start a call with ${to}`)
            try {
                const offer = await pc.createOffer(this.offerOptions)
                log(`${this.username} setLocalDescription: start`)
                await pc.setLocalDescription(offer)
                log(`${this.username} setLocalDescription: finished`)
                this.sendSignalingMessage(pc.localDescription, true, to, room, conference)
            } catch (error) {
                log(`Error creating the offer from ${this.username}. Error: ${error}`)
            }
        },
        async createAnswer(pc, to, room, conference) {
            log(`${this.username} create an answer: start`)
            try {
                const answer = await pc.createAnswer()
                log(`${this.username} setLocalDescription: start`)
                await pc.setLocalDescription(answer)
                log(`${this.username} setLocalDescription: finished`)
                this.sendSignalingMessage(pc.localDescription, false, to, room, conference)
            } catch (error) {
                log(`Error creating the answer from ${this.username}. Error: ${error}`)
            }
        },
        async handleAnswer(desc, pc, from, room, conference = false) {
            log(`${this.username} gets an offer from ${from}`)
            await this.setRemoteDescription(desc, pc)
            this.createAnswer(pc, from, room, conference)
        },
        sendSignalingMessage(desc, offer, to, room, conference) {
            const isOffer = offer ? DESCRIPTION_TYPE.offer : DESCRIPTION_TYPE.answer
            log(`${this.username} sends the ${isOffer} through the signal channel to ${to} in room ${room}`)

            // send the offer to the other peer
            this.$socket.emit(conference ? WS_EVENTS.PCSignalingConference : WS_EVENTS.privateMessagePCSignaling, {
                desc: desc,
                to: to,
                from: this.username,
                room: room,
            })
        },
        addLocalStream(pc) {
            pc.addStream(this.localStream)
        },
        addCandidate(pc, candidate) {
            try {
                log(`${this.username} added a candidate`)
                pc.addIceCandidate(candidate)
            } catch (error) {
                log(`Error adding a candidate in ${this.username}. Error: ${error}`)
            }
        },
        onIceCandidates(pc, to, room, conference = false) {
            pc.onicecandidate = ({ candidate }) => {
                if (!candidate) return
                setTimeout(() => {
                    this.$socket.emit(conference ? WS_EVENTS.PCSignalingConference : WS_EVENTS.privateMessagePCSignaling, {
                        candidate,
                        to: to,
                        from: this.username,
                        room: room,
                    })
                }, 500)
            }
        },
        onAddStream(user, video) {
            user.pc.onaddstream = event => {
                user.peerVideo = user.peerVideo || document.getElementById(video)
                if (!user.peerVideo.srcObject && event.stream) {
                    user.peerStream = event.stream
                    user.peerVideo.srcObject = user.peerStream
                }
            }
        },
        pauseVideo() {
            this.localStream.getVideoTracks().forEach(t => (t.enabled = !t.enabled))
        },
        pauseAudio() {
            this.localStream.getAudioTracks().forEach(t => (t.enabled = !t.enabled))
        },
    },
}