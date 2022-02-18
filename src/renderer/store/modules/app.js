import path from 'path'

const state = {
  height: 0,
  width: 0,
  menubarHeight: 0,
  config: {},
  configPath: path.join('static', '..', 'config.json')
}

const mutations = {
  CONFIG (state, data) {
    state.config = data
  },
  WIDTH (state, data) {
    state.width = data
  },
  HEIGHT (state, data) {
    state.height = data
  },
  MENUBAR_HEIGHT (state, data) {
    state.menubarHeight = data
  }
}

const actions = {
}

export default {
  state,
  mutations,
  actions
}
