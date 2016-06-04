import Turntable from './turntable'

const FADE_TIME = 6000

class Channel {
  constructor () {
    this.level = 0
    this.turntable = null
    this.inTheMix = false
    this.fade = null
    this.cachedFadeCallback = null
    this.fading = false
  }

  fadeOut (callback) {
    window.clearInterval(this.fade)

    this.fading = 'out'
    this.cachedFadeCallback = callback

    this.fade = window.setInterval(function () {
      this.setLevel(this.level - 1)
      if (this.level === 0) {
        window.clearInterval(this.fade)
        this.fading = false
        this.cachedFadeCallback = null
        callback()
      }
    }.bind(this), FADE_TIME / 100)
  }

  fadeIn (callback) {
    window.clearInterval(this.fade)

    this.fading = 'in'
    this.cachedFadeCallback = callback

    this.fade = window.setInterval(function () {
      this.setLevel(this.level + 1)
      if (this.level === 100) {
        window.clearInterval(this.fade)
        this.fading = false
        this.cachedFadeCallback = null
        callback()
      }
    }.bind(this), FADE_TIME / 100)
  }

  setLevel (level) {
    if (level < 0) level = 0
    if (level > 100) level = 100

    this.turntable._setPlayerVolume(level)
    this.level = level

    return this
  }

  setInTheMix (inTheMix) {
    this.inTheMix = inTheMix

    return this
  }

  isInTheMix () {
    return this.inTheMix
  }
}

// Mixer definition
const Mixer = {
  channels: [new Channel(), new Channel()]
}

// Get a channel (1 indexed)
Mixer.channel = function (channelNumber) {
  if (!this.channels[channelNumber - 1]) {
    return false
  }

  return this.channels[channelNumber - 1]
}

// Connect a turntable to a mixer channel
Mixer.connectTableToChannel = function (table, channelNumber) {
  var channel = this.channel(channelNumber)
  if (!channel || !Turntable) {
    return false
  }

  channel.turntable = table
}

// Save channel levels and fades
Mixer.saveLevels = function () {
  // Channel 1
  window.clearInterval(this.channel(1).fade)

  // Channel 2
  window.clearInterval(this.channel(2).fade)
}

// Recall channel levels and fades
Mixer.recallLevels = function () {
  // Channel 1
  if (this.channel(1).fading === 'in') {
    this.channel(1).fadeIn(this.channel(1).cachedFadeCallback)
  } else if (this.channel(1).fading === 'out') {
    this.channel(1).fadeOut(this.channel(1).cachedFadeCallback)
  }

  // Channel 2
  if (this.channel(2).fading === 'in') {
    this.channel(2).fadeIn(this.channel(2).cachedFadeCallback)
  } else if (this.channel(2).fading === 'out') {
    this.channel(2).fadeOut(this.channel(2).cachedFadeCallback)
  }
}

export default Mixer
