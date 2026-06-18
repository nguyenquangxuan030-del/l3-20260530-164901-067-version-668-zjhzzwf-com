document.addEventListener('DOMContentLoaded', function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-video-url]'));

  boxes.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.player-overlay');
    var url = box.getAttribute('data-video-url');
    var loaded = false;
    var hls = null;

    function loadVideo() {
      if (!video || !url) {
        return Promise.resolve();
      }

      if (loaded) {
        return video.play();
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }

      return video.play();
    }

    function startPlayback() {
      box.classList.add('playing');
      loadVideo().catch(function () {
        box.classList.remove('playing');
      });
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });

      video.addEventListener('play', function () {
        box.classList.add('playing');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          box.classList.remove('playing');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
});
