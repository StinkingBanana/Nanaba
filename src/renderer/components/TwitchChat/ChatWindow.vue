<template>
  <div id='wrapper' v-bind:style="{height: this.height + 'px'}"  ref="chatHistory">
    <article class="media" v-for="(item, index) in chat" :key="index" ref="chatArticle">
      <figure class="media-left" style="-webkit-user-select: none;" v-on:mousedown.prevent>
        <!-- <p class="image is-48x48">
          <img src="static/profilepic_placeholder.png">
        </p> -->
      </figure>
      <div class="media-content">
        <div class="content">
          <div class="level is-mobile">
            <div class="level-left">
              <span class="icon" v-if="item.badges !== null && item.badges['broadcaster']">
                <img src="static/badge_broadcaster.png">
              </span>
              <span class="icon" v-if="item['sub'] !== undefined && item.sub">
                <img src="static/badge_sub.png">
              </span>
              <span class="icon" v-if="item['mod'] !== undefined && item.mod">
                <img src="static/badge_mod.png">
              </span>
              <span class="icon" v-if="item.badges !== null && item.badges['premium']">
                <img src="static/badge_prime.png">
              </span>
              <span class="icon" v-if="item['turbo'] !== undefined && item.turbo">
                <img src="static/badge_turbo.png">
              </span>
              <strong class="level-item">{{item.displayname}}</strong> 
              <small class="level-item">@{{item.username}}</small>
            </div>
            <div class="level-right">
              <small class="level-item">{{item.createdAt}}</small>
            </div>
          </div>
          <div>
            <span v-if="item['messageType'] === 'whisper'">
              <b>[ WHISPER ]: </b>
            </span>
            <span v-for="(m, index) in markupURL(item.message)" :key="index">
              <span v-if="index%2==0">{{m}}</span>
              <a href="#" @click="openLink(m)" v-else>{{m}}</a>
            </span>
          </div>
        </div>
      </div>
      <div class="media-right">
        <a class="icon" @click="gtts(item)"  v-tooltip="'Google Speech'" v-if="noGapi">
          <font-awesome-icon :icon="faWonSign" />
        </a>
        <a class="icon" @click="play(item.message)" v-tooltip="'Microsoft Speech'">
          <font-awesome-icon :icon="faPlay" />
        </a>
      </div>
    </article>
  </div>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faPlay from '@fortawesome/fontawesome-free-solid/faPlay'
  import faWonSign from '@fortawesome/fontawesome-free-solid/faWonSign'
  import {ipcRenderer} from 'electron'
  import axios from 'axios'
  import SimpleTTS from 'simpletts'
  const tts = new SimpleTTS()
  
  export default {
    components: { FontAwesomeIcon },
    props: ['height'],
    computed: {
      faPlay () {
        return faPlay
      },
      faWonSign () {
        return faWonSign
      },
      chat () {
        return this.$store.state.chat.history
      },
      noGapi () {
        return this.$store.state.app.config['gapi'] !== undefined
      }
    },
    methods: {
      openLink: function (link) {
        this.$electron.shell.openExternal(link)
      },
      scrolldown: function () {
        this.$refs.chatHistory.scrollTop = this.$refs.chatHistory.scrollHeight
      },
      play: function (msg) {
        ipcRenderer.sendSync('tts', msg)
      },
      containEnglishAndNumberOnly: function (str) {
        if (str === undefined) return false
        return /^[a-zA-Z0-9 ]*$/.test(str)
      },
      containJapanese: function (str) {
        if (str === undefined) return false
        return /[\u3040-\u309f\u30A0-\u30FF]/.test(str)
      },
      escapeLink: function (str) {
        if (str === undefined) return str
        /* eslint-disable */
        return str.replace(/((http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?)/, "LINK")
      },
      gtts: function (item) {
        if (this.$store.state.app.config['gapi'] === undefined) {
          return
        }
        if (item.wavenet === undefined) {
          let gapi = this.$store.state.app.config['gapi']
          let tosay = this.escapeLink(item.message)

          if (this.containJapanese(tosay)) {
            axios({
              method: 'post',
              url: 'https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=' + gapi,
              data: {
                'input': {
                  'text': tosay
                },
                'voice': {
                  'languageCode': 'ja-JP',
                  'name': 'ja-JP-Standard-A',
                  'ssmlGender': 'FEMALE'
                },
                'audioConfig': {
                  'audioEncoding': 'MP3'
                }
              },
              responseType: 'json'
            }).then(function (response) {
              item.gtts = 'data:audio/ogg;base64,' + response.data.audioContent
              new Audio(item.gtts).play()
            }).catch(function (err) {
              console.log(err)
            })
          }
          else if (this.containEnglishAndNumberOnly(tosay)) {
            axios({
              method: 'post',
              url: 'https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=' + gapi,
              data: {
                'input': {
                  'text': tosay
                },
                'voice': {
                  'languageCode': 'en-US',
                  'name': 'en-US-Wavenet-C',
                  'ssmlGender': 'FEMALE'
                },
                'audioConfig': {
                  'audioEncoding': 'MP3'
                }
              },
              responseType: 'json'
            }).then(function (response) {
              item.gtts = 'data:audio/ogg;base64,' + response.data.audioContent
              new Audio(item.gtts).play()
            }).catch(function (err) {
              console.log(err)
            })
          }
          else {
            tts.read({ "text": item.message, "volume": 100, "speed": 50, "voice": {gender: "female", name: "microsoft hanhan desktop"} })
          }

        } else {
          if (item.gtts) {
            new Audio(item.gtts).play()
          }  
          // else if (item.message) {
          //   var u = new SpeechSynthesisUtterance()
          //   u.text = item.message
          //   u.lang = 'zh-TW'
          //   speechSynthesis.speak(u)
          // }
        }
      },
      markupURL: function (str) {
        // Since v-html will not be compiled as Vue templates
        // This is a hack to seperate link and normal text
        // Link will be even items
        let randomString = Math.random().toString(36).substr(2, 12)
        let out = str.replace(
          /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/,
          `<${randomString}>` + '$1' + `<${randomString}>`)
        out = out.split(`<${randomString}>`)
        return out
      }
    },
    updated () {
      this.scrolldown()
    },
    data () {
      return {
      }
    },
    mounted () {
    }
  }
</script>

<style scoped>
  #wrapper {
    padding: 10px;
    overflow-y: scroll !important;
    background: lightgrey;
  }
  .level {
    margin: 0;
  }

  /*TOOLTIP*/
  .tooltip {
    display: block !important;
    z-index: 10000;
  }
  .tooltip .tooltip-inner {
    background: black;
    color: white;
    border-radius: 16px;
    padding: 5px 10px 4px;
  }
  .tooltip .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
    z-index: 1;
  }
  .tooltip[x-placement^=top] {
    margin-bottom: 5px;
  }
  .tooltip[x-placement^=top] .tooltip-arrow {
    border-width: 5px 5px 0 5px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    bottom: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
  }
  .tooltip[x-placement^=bottom] {
    margin-top: 5px;
  }
  .tooltip[x-placement^=bottom] .tooltip-arrow {
    border-width: 0 5px 5px 5px;
    border-left-color: transparent !important;
    border-right-color: transparent !important;
    border-top-color: transparent !important;
    top: -5px;
    left: calc(50% - 5px);
    margin-top: 0;
    margin-bottom: 0;
  }
  .tooltip[x-placement^=right] {
    margin-left: 5px;
  }
  .tooltip[x-placement^=right] .tooltip-arrow {
    border-width: 5px 5px 5px 0;
    border-left-color: transparent !important;
    border-top-color: transparent !important;
    border-bottom-color: transparent !important;
    left: -5px;
    top: calc(50% - 5px);
    margin-left: 0;
    margin-right: 0;
  }
  .tooltip[x-placement^=left] {
    margin-right: 5px;
  }
  .tooltip[x-placement^=left] .tooltip-arrow {
    border-width: 5px 0 5px 5px;
    border-top-color: transparent !important;
    border-right-color: transparent !important;
    border-bottom-color: transparent !important;
    right: -5px;
    top: calc(50% - 5px);
    margin-left: 0;
    margin-right: 0;
  }
  .tooltip[aria-hidden=true] {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s, visibility 0.15s;
  }
  .tooltip[aria-hidden=false] {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.15s;
  }
</style>
