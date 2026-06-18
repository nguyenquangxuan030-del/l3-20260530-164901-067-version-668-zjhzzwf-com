import { H as Hls } from './hls-engine.js';

function setupPlayer(player) {
  var video = player.querySelector('video');
  var source = player.getAttribute('data-video-source');
  var toggleButtons = player.querySelectorAll('[data-video-toggle]');
  var overlayButton = player.querySelector('[data-video-overlay]');
  var muteButton = player.querySelector('[data-video-mute]');
  var fullscreenButton = player.querySelector('[data-video-fullscreen]');
  var hls = null;

  if (!video || !source) {
    return;
  }

  if (Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else {
    video.src = source;
  }

  function updateState() {
    player.classList.toggle('playing', !video.paused);
    toggleButtons.forEach(function (button) {
      button.textContent = video.paused ? '播放' : '暂停';
    });
    if (muteButton) {
      muteButton.textContent = video.muted ? '取消静音' : '静音';
    }
  }

  function togglePlay() {
    if (video.paused) {
      video.play().catch(function () {});
    } else {
      video.pause();
    }
  }

  toggleButtons.forEach(function (button) {
    button.addEventListener('click', togglePlay);
  });

  if (overlayButton) {
    overlayButton.addEventListener('click', togglePlay);
  }

  video.addEventListener('click', togglePlay);
  video.addEventListener('play', updateState);
  video.addEventListener('pause', updateState);
  video.addEventListener('ended', updateState);

  if (muteButton) {
    muteButton.addEventListener('click', function () {
      video.muted = !video.muted;
      updateState();
    });
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener('click', function () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (player.requestFullscreen) {
        player.requestFullscreen();
      }
    });
  }

  updateState();
}

document.querySelectorAll('[data-video-player]').forEach(setupPlayer);
