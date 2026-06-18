(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    shells.forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-cover');
        var streamUrl = shell.getAttribute('data-url') || '';
        var ready = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function prepare() {
            if (ready) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function start() {
            prepare();

            if (button) {
                button.classList.add('hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove('hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (button) {
                button.classList.remove('hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
}());
