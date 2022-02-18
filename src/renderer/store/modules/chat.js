import {ipcRenderer} from 'electron'

const state = {
  history: [],
  viewers: {},
  mute: true
}

const mutations = {
  ADD_MSG (state, data) {
    state.history.push(data)
    if (state.history.length > 100) {
      state.history.shift()
    }
  },
  ADD_NAME (state, data) {
    if (!(data in state.viewers)) {
      // state.viewers[data] = {}
      this._vm.$set(state.viewers, data, {})
    }
  },
  REMOVE_NAME (state, data) {
    if ((data in state.viewers)) {
      // state.viewers[data] = undefined
      this._vm.$set(state.viewers, data, undefined)
    }
  },
  TOGGLE_MUTE (state) {
    state.mute = !state.mute
  }
}

const actions = {
  USER_MSG ({commit}, data) {
    let processed = {
      type: data.type,
      color: data.userstate.color,
      badges: data.userstate.badges,
      mod: data.userstate.mod,
      sub: data.userstate.subscriber,
      turbo: data.userstate.turbo,
      displayname: data.userstate['display-name'],
      messageType: data.userstate['message-type'],
      username: data.userstate.username,
      message: data.message,
      createdAt: this._vm.$moment().format('MM/DD HH:mm:ss')
    }
    commit('ADD_MSG', processed)

    if (!data.self && !state.mute && data.userstate['message-type'] !== 'whisper') {
      ipcRenderer.sendSync('tts', data.message)
    }
  },
  SAY ({dispatch, commit}, msg) {
    this._vm.$twitch.client.say('#stinkingbanana', msg)
  }
}

export default {
  state,
  mutations,
  actions
}
