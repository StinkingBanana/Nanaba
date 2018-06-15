import { client } from 'tmi.js'
import axios from 'axios'

class TwitchIRC {
  constructor () {
    if (!TwitchIRC.instance) {
      // eslint-disable-next-line
      this.client = new client({
        options: {
          debug: true
        },
        connection: {
          reconnect: true
        }
      })
      TwitchIRC.instance = this
    }
    return TwitchIRC.instance
  }

  client () {
    return this.client
  }

  connect (data) {
    return new Promise(function (resolve, reject) {
      axios({
        method: 'get',
        url: 'https://api.twitch.tv/kraken?oauth_token=' + data,
        responseType: 'json'
      }).then(function (response) {
        instance.client.opts.identity = {
          username: response.data.token['user_name'],
          password: data
        }
        instance.client.opts.channels = ['#' + response.data.token['user_name']]
        instance.client.connect()
        resolve()
      }).catch(function (err) {
        reject(err)
      })
    })
  }

  on (event, func) {
    this.client.on(event, func)
  }
}

const instance = new TwitchIRC()
Object.freeze(instance)

export default instance
