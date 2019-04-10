# video-chat
> Video chat application using [VueJS](https://vuejs.org), [Vuex](https://vuex.vuejs.org), [WebRTC](https://webrtc.org/start/), [SocketIO](https://socket.io), NodeJS and [Redis](https://github.com/NodeRedis/node_redis)

## Quick start
First of all, you need to install and run the redis in your PC. Here there is an [article](https://medium.com/@petehouston/install-and-config-redis-on-mac-os-x-via-homebrew-eb8df9a4f298) for Mac OS X. Once Redis is up and running:

```bash
# Clone the repo
git clone https://github.com/adrigardi90/video-chat

# Change into the repo directory
cd video-chat

# install
npm install 

# Start the FE in dev mode
npm run serve

# Start the server
npm run run:server

```
Then visit http://localhost:8080 in your browser

## Horizontal scaling
To test the horizontal scaling we need to run two different instances. Each one will run a nodeJS process serving the FE and 
exposing the API

<p align="center">
  <img src="https://github.com/adrigardi90/video-chat/blob/master/src/assets/scaling.png" alt="scaling" width="500" height="250"/>
</p>


```bash
# Build the images
docker-compose build

# Create and run the two instances
docker-compose up

```

Then you'll find on http://localhost:3000 and http://localhost:3001  both FE applications, each one with a different socket connection

