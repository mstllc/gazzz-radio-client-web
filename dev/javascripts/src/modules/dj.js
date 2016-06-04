import Mixer from './mixer'
import Turntable from './turntable'
import $ from 'jquery'

// Constants
const WATCH_TABLES_INTERVAL = 750
const MIX_AT_TIME_REMAINING = 20

// DJ definition
const DJTanner = {
  xone23: Mixer,
  $xone23: $('#mixer'),
  tech12s: Array(2),
  watchTables: null,
  currentTable: null
}

// Get setup
DJTanner.party = function () {
  // Setup turntables
  this.tech12s[0] = this.createTable(1)
  this.tech12s[1] = this.createTable(2)

  // Connect turntables
  this.xone23.connectTableToChannel(this.table(1), 1)
  this.xone23.connectTableToChannel(this.table(2), 2)

  // Power up turntables and wait for power
  this.table(1).powerUp()
  this.table(2).powerUp()
}

// Start mixing
DJTanner.spinThatShit = function () {
  // Pull record and play on first channel
  this.pullRecord(function (error, record) {
    if (error) {
      return false
    }

    // Turn up channel 1, prepare the record and play
    this.xone23.channel(1).setLevel(100).setInTheMix(true)
    this.table(1).prepareRecord(record).play()
    this.currentTable = this.table(1)

    // Keep eyes on tables to know when to mix
    this.eyesOnTables()

    // Update now playing
    this.updateNowPlaying()

    // Change play button
    $('a.play-pause').removeClass('play').addClass('pause')

    // Turn down channel 2 and pull a record to prepare
    this.xone23.channel(2).setLevel(0)
    this.pullRecord(function (error, record) {
      if (error) {
        return false
      }

      // Prepare the record on channel 2, pause and wait
      this.table(2).prepareRecord(record).pause()
    }, this)
  }, this)
}

// Check tables for ending records
DJTanner.eyesOnTables = function () {
  window.clearInterval(this.watchTables)
  this.watchTables = window.setInterval(function () {
    var remaining = this.currentTable.timeRemaining()
    if (remaining > -1 && remaining < MIX_AT_TIME_REMAINING) {
      if (this.currentTable === this.table(1)) {
        this.performMixFromChannelToChannel(1, 2)
      } else {
        this.performMixFromChannelToChannel(2, 1)
      }
    }
  }.bind(this), WATCH_TABLES_INTERVAL)
}

// Stop watching tables for ending records
DJTanner.eyesOffTables = function () {
  window.clearInterval(this.watchTables)
}

// Perform mix
DJTanner.performMixFromChannelToChannel = function (fromChannel, toChannel) {
  this.currentTable = this.table(toChannel)

  this.xone23.channel(toChannel).setLevel(0)
  this.table(toChannel).play()

  this.xone23.channel(fromChannel).fadeOut(function () {
    this.xone23.channel(fromChannel).setInTheMix(false).setLevel(0)
    this.table(fromChannel).pause()

    // Pull a record to prepare
    this.pullRecord(function (error, record) {
      if (error) {
        return false
      }

      // Prepare the record on channel 2, pause and wait
      this.table(fromChannel).prepareRecord(record).pause()
    }, this)
  }.bind(this))

  this.xone23.channel(toChannel).fadeIn(function () {})

  this.xone23.channel(toChannel).setInTheMix(true)

  this.updateNowPlaying()
}

// Update now playing
DJTanner.updateNowPlaying = function () {
  var parts = this.currentTable.currentTrack.title.split(' - ')
  var link = 'http://www.discogs.com/search/?q=' + encodeURIComponent(parts[0] + ' - ' + parts[1]) + '&type=all'
  var info = '<a href="' + link + '" target="_blank"><span class="ital">' + parts[0] + '</span> - ' + parts[1] + '</a>'
  $('div.track-info p').html(info)
}

// Pull record
DJTanner.pullRecord = function (callback, scope) {
  $.getJSON('https://api.gazzz.thorsonmscott.com/tracks/random').done(function (record) {
    callback.call(scope, null, record)
  }).fail(function (jqXHR, textStatus, error) {
    callback.call(scope, error)
  })
}

// Create table
DJTanner.createTable = function (channelNumber) {
  var table = new Turntable(channelNumber)
  var $table = $('<div id="table-' + channelNumber + '" class="inner-wrapper deck"></div>')
  this.$xone23.append($table)

  $(table).on('tablePowered', $.proxy(this._onTablePowered, this))

  return table
}

// Get table (1 indedex)
DJTanner.table = function (channelNumber) {
  if (!this.tech12s[channelNumber - 1]) {
    return false
  }

  return this.tech12s[channelNumber - 1]
}

// Pause all playback
DJTanner.pause = function () {
  this.xone23.saveLevels()

  // Channel 1
  if (this.xone23.channel(1).isInTheMix()) {
    this.table(1).pause()
  }

  // Channel 2
  if (this.xone23.channel(2).isInTheMix()) {
    this.table(2).pause()
  }

  $('a.play-pause').removeClass('pause').addClass('play')
}

// Resume playback
DJTanner.resume = function () {
  this.xone23.recallLevels()

  // Channel 1
  if (this.xone23.channel(1).isInTheMix()) {
    this.table(1).play()
  }

  // Channel 2
  if (this.xone23.channel(2).isInTheMix()) {
    this.table(2).play()
  }

  $('a.play-pause').removeClass('play').addClass('pause')
}

// Skip this track
DJTanner.boooNextTrack = function () {
  if (this.table(1) === this.currentTable) {
    this.performMixFromChannelToChannel(1, 2)
  } else {
    this.performMixFromChannelToChannel(2, 1)
  }
}

// Callback for turntable powered up event
DJTanner._onTablePowered = function () {
  if (this.table(1).powered && this.table(2).powered) {
    this.$xone23.removeClass('loading')
    this.spinThatShit()
  }
}

export default DJTanner
