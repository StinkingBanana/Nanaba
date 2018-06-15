<template>    
  <div v-bind:style="{width: appWidth + 'px', height: appHeight + 'px'}" v-on:keyup.enter="focusInput">
    <div class="columns is-gapless">
      <div class="column is-10">
        <ChatWindow v-bind:height="chatWindowHeight"></ChatWindow>
      </div>
      <div class="column is-2 is-hidden-mobile">
        <ViewerWindow v-bind:height="chatWindowHeight"></ViewerWindow>
      </div>
    </div>
    <div class="field" id="chatInputContainer">
      <div class="control">
        <input v-autofocus id="chatInput" ref="chatInput" class="input is-info" type="text" @keyup.enter="sendmessage">
      </div>
    </div>
  </div>
</template>

<script>
  import ChatWindow from './TwitchChat/ChatWindow'
  import ViewerWindow from './TwitchChat/ViewerWindow'
  import TwitchIRC from '../utli/twitchIRC'
  import fs from 'fs'
  import jsonfile from 'jsonfile'

  export default {
    name: 'twtichChat-page',
    components: { ChatWindow, ViewerWindow },
    data: () => {
      return {
        inputHeight: 0
      }
    },
    computed: {
      chatWindowHeight: function () {
        return this.$store.state.app.height - this.menubarHeight - this.inputHeight
      },
      appWidth: function () {
        return this.$store.state.app.width
      },
      appHeight: function () {
        return this.$store.state.app.height
      },
      menubarHeight: function () {
        return this.$store.state.app.menubarHeight
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      sendmessage (e) {
        if (e.target.value !== '') {
          this.$store.dispatch('SAY', e.target.value)
        }
        e.target.value = ''
        return false
      },
      focusInput (e) {
        this.$el.querySelector('#chatInput').focus()
      }
    },
    mounted () {
      this.inputHeight = this.$refs.chatInput.clientHeight
      let config = {}
      if (fs.existsSync(this.$store.state.app.configPath)) {
        config = jsonfile.readFileSync(this.$store.state.app.configPath)
      } else {
        this.$router.push('/login')
      }
      if (!config['oauth']) {
        this.$router.push('/login')
      } else {
        if (TwitchIRC.client.readyState() === 'CLOSED') {
          TwitchIRC.connect(config['oauth']).then(() => {
            // connect okay
            this.$store.commit('CONFIG', config)
          }).catch(() => {
            config['oauth'] = undefined
            this.$store.commit('CONFIG', config)
            jsonfile.writeFileSync(this.$store.state.app.configPath, config)
            this.$router.push('/login')
          })
        }
      }
    }
  }
</script>

<style scoped>
  #chatInputContainer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
  }
</style>
