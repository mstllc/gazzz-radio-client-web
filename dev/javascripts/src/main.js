import DJTanner from './modules/dj'
import $ from 'jquery'

var $playPauseButton

// YouTube iFrame API init callback
window.onYouTubeIframeAPIReady = function () {
  if (DJTanner) {
    DJTanner.party()

    $playPauseButton = $('a.play-pause')
    $playPauseButton.on('click', onPlayPauseClick)
    $('a.skip').on('click', onSkipClick)
    $(window).on('keydown', onWindowKeyDown)
  }
}

function onPlayPauseClick (e) {
  e.preventDefault()
  playPause()
}

function onWindowKeyDown (e) {
  e.preventDefault()
  if (e.which === 32) {
    playPause()
  }
}

function playPause () {
  if ($playPauseButton.hasClass('play')) {
    DJTanner.resume()
  } else {
    DJTanner.pause()
  }
}

function onSkipClick (e) {
  e.preventDefault()
  DJTanner.boooNextTrack()
}
