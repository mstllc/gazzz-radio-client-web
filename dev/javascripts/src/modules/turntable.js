import $ from 'jquery'

class Track {
  constructor (record) {
    this.videoId = record.videoId
    this.duration = -1
    this.title = record.title
  }
}

export default class Turntable {
  constructor (channelNumber) {
    this.channelNumber = channelNumber
    this.currentTecord = null
    this.powered = false
  }

  powerUp () {
    this._player = new window.YT.Player('table-' + this.channelNumber, {
      height: '100%',
      width: '100%',
      playerVars: {
        playerapiid: this.channelNumber,
        autoplay: 0,
        controls: 0,
        enablejsapi: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        playsinline: 1
      },
      events: {
        'onReady': $.proxy(this._onPlayerReady, this),
        'onStateChange': $.proxy(this._onStateChange, this)
      }
    })
  }

  prepareRecord (record) {
    this.currentTrack = new Track(record)
    this._player.loadVideoById(this.currentTrack.videoId)

    return this
  }

  timeRemaining () {
    if (this.currentTrack.duration < 0) {
      return -1
    }

    return this.currentTrack.duration - this._player.getCurrentTime()
  }

  pause () {
    this._player.pauseVideo()

    return this
  }

  play () {
    this._player.playVideo()

    return this
  }

  _setPlayerVolume (level) {
    this._player.setVolume(level)
    this.$elm.css('opacity', level / 100)
  }

  _onPlayerReady () {
    // Cache element
    this.$elm = $('#table-' + this.channelNumber)

    this.powered = true
    $(this).trigger('tablePowered')
  }

  _onStateChange (e) {
    switch (e.data) {
      case -1:
        // Unstarted
        break

      case 0:
        // Ended
        break

      case 1:
        // Playing
        this.currentTrack.duration = this._player.getDuration()
        break

      case 2:
        // Paused
        break

      case 3:
        // Buffering
        break

      case 5:
        // Cued
        break

      default:
        break

    }
  }
}
