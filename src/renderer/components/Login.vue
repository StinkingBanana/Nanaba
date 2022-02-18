<template>    
  <div id="wrapper" v-bind:style="{width: appWidth + 'px', height: appHeight + 'px'}">
    <div class="centerForm">
      <h1>Step 1. Get your OAuth token</h1>
      <div class="level">
        <div class="level-item">
          <a ref="#" @click="openLink('https://twitchapps.com/tmi/')">
            <img src="static/connectTwitch.png">
          </a>
        </div>
      </div>
      <h1>Step 2. Copy & Paste your OAuth token</h1>
      <div class="field">
        <p class="control has-icons-left center80" >
          <input id="oauthInput" class="input" type="text" placeholder="oauth:" v-model="oauth" @keydown.enter="tryToConnect">
          <span class="icon is-small is-left">
            <font-awesome-icon :icon="faKey" />
          </span>
        </p>
      </div>
    </div>
    <div v-bind:style="{width: appWidth + 'px', height: appHeight + 'px'}">
      <video autoplay loop id="video-background" muted plays-inline>
        <source src="static/twitchLogo.mp4" type="video/mp4">
      </video>
    </div>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faKey from '@fortawesome/fontawesome-free-solid/faKey'
  import TwitchIRC from '../utli/twitchIRC'
  import fs from 'fs'
  import jsonfile from 'jsonfile'

  export default {
    name: 'login-page',
    components: { FontAwesomeIcon },
    data: () => {
      return {
        inputHeight: 0,
        navHeight: 0,
        oauth: ''
      }
    },
    computed: {
      faKey () {
        return faKey
      },
      chatWindowHeight: function () {
        return this.$store.state.app.height - this.navHeight
      },
      appWidth: function () {
        return this.$store.state.app.width
      },
      appHeight: function () {
        return this.$store.state.app.height
      }
    },
    methods: {
      openLink: function (link) {
        this.$electron.shell.openExternal(link)
      },
      tryToConnect: function () {
        if (this.oauth.match('^oauth:\\w+')) {
          let oauthToken = this.oauth.slice(6)
          TwitchIRC.connect(oauthToken).then(() => {
            let config = {}
            if (fs.existsSync(this.$store.state.app.configPath)) {
              config = jsonfile.readFileSync(this.$store.state.app.configPath)
            }
            config['oauth'] = oauthToken
            this.$store.commit('CONFIG', config)
            jsonfile.writeFileSync(this.$store.state.app.configPath, config)
            this.$router.push('/')
          }).catch(function (err) {
            console.log(err)
          })
        }
        this.oauth = ''
      }
    },
    mounted () {
    }
  }
</script>

<style scoped>
  .level{
    margin-bottom: 10px;
  }
  h1 {
    margin-bottom: 5px;
    color: black;
    font-weight: 700;
    text-shadow:
       1px 1px 0 white,
     -1px -1px 0 white,  
      1px -1px 0 white,
      -1px 1px 0 white,
       1px 1px 0 white;
  }
  .centerForm {
    background: rgba(130,130,130,0.5);
    width: 475px;
    height: 170px;
    margin: 0 auto;
    padding: 20px;
    position: relative;
    top: 42%;
    border-radius: 25px;
  }
  .center80 {
    margin: 0 auto;
    width: 80%;
  }
  #connectButton {
    display: inline-block;
    margin: 0 auto;
    width: 170px;
  }
  #oauthInput {
    color: black;
    border-radius: 10px;
  }
  #video-background {
    position: fixed;
    right: 0; 
    bottom: 0;
    min-width: 100%; 
    min-height: 100%;
    width: auto; 
    height: auto;
    z-index: -100;
    object-fit: fill;
  }
</style>
