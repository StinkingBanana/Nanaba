<template>
  <nav class="menubar level is-mobile" style="-webkit-app-region: drag">
    <div class="level-left">
        <div class="level-item">
        </div>
        <div class="level-item">
          <div class="subtitle">
            <img class="image is-24x24" src="static/icon.ico">
            <strong>Nanaba</strong>
            <small>v0.0.1</small>
          </div>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item" style="-webkit-app-region: no-drag" v-if="$route.path=='/'">
          <a id="mutebutton" class="button is-black is-inverted is-outlined" @click="tooglemute" v-tooltip="'Autoplay Speech'">
            <font-awesome-icon :icon="faVolumeUp" v-if="!muteState" />
            <font-awesome-icon :icon="faVolumeOff" v-if="muteState" />
          </a>
        </div>
        <div class="level-item" style="-webkit-app-region: no-drag">
          <a class="button is-black is-inverted is-outlined" @click="minimize">‒</a>
        </div>
        <div class="level-item" style="-webkit-app-region: no-drag">
          <a class="button is-black is-inverted is-outlined" @click="maximize">▢</a>
        </div>
        <div class="level-item" style="-webkit-app-region: no-drag">
          <a class="button is-black is-inverted is-outlined" @click="close">✕</a>
        </div>
        <div class="level-item">
        </div>
      </div>
  </nav>
</template>

<script>
  import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
  import faVolumeUp from '@fortawesome/fontawesome-free-solid/faVolumeUp'
  import faVolumeOff from '@fortawesome/fontawesome-free-solid/faVolumeOff'
  import {remote} from 'electron'
  
  export default {
    components: { FontAwesomeIcon },
    computed: {
      faVolumeOff () {
        return faVolumeOff
      },
      faVolumeUp () {
        return faVolumeUp
      },
      muteState () {
        return this.$store.state.chat.mute
      }
    },
    data () {
      return {
      }
    },
    methods: {
      tooglemute: function () {
        this.$store.commit('TOGGLE_MUTE')
      },
      minimize: () => {
        remote.BrowserWindow.getFocusedWindow().minimize()
      },
      maximize: () => {
        let currentWindow = remote.BrowserWindow.getFocusedWindow()

        if (currentWindow.isMaximized()) {
          currentWindow.unmaximize()
        } else {
          currentWindow.maximize()
        }
      },
      close: () => {
        remote.BrowserWindow.getFocusedWindow().close()
      }
    },
    mounted () {
      let height = this.$el.clientHeight
      this.$store.commit('MENUBAR_HEIGHT', height)
    }
  }
</script>

<style scoped>
  .menubar {
    background: darkgrey;
    height: 48px; 
    margin: 0;
    font-family: "Microsoft YaHei"
  }
  #mutebutton{
    width: 48px;
  }
</style>
