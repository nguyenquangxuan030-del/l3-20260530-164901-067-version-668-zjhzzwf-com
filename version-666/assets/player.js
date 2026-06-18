(function () {
  window.initPlayer = function (videoUrl) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var hls = null;
    var ready = false;

    if (!video || !cover || !videoUrl) {
      return;
    }

    function bindVideo() {
      if (ready) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        ready = true;
        return;
      }

      video.src = videoUrl;
      ready = true;
    }

    function startPlay() {
      bindVideo();
      cover.classList.add("is-hidden");
      video.controls = true;
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    cover.addEventListener("click", startPlay);

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlay();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
