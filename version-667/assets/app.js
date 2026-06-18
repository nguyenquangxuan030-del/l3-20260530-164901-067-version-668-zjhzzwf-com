(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  const searchInput = document.querySelector('[data-search-input]');
  const regionFilter = document.querySelector('[data-region-filter]');
  const typeFilter = document.querySelector('[data-type-filter]');
  const yearFilter = document.querySelector('[data-year-filter]');
  const cardList = document.querySelector('[data-card-list]');
  const emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cardList) {
      return;
    }

    const query = normalize(searchInput && searchInput.value);
    const region = normalize(regionFilter && regionFilter.value);
    const type = normalize(typeFilter && typeFilter.value);
    const year = normalize(yearFilter && yearFilter.value);
    const cards = Array.from(cardList.querySelectorAll('.movie-card'));
    let visible = 0;

    cards.forEach(function (card) {
      const text = normalize(card.getAttribute('data-search'));
      const cardRegion = normalize(card.getAttribute('data-region'));
      const cardType = normalize(card.getAttribute('data-type'));
      const cardYear = normalize(card.getAttribute('data-year'));
      const matched = (!query || text.indexOf(query) !== -1) &&
        (!region || cardRegion === region) &&
        (!type || cardType === type) &&
        (!year || cardYear === year);

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  [searchInput, regionFilter, typeFilter, yearFilter].forEach(function (element) {
    if (element) {
      element.addEventListener('input', applyFilters);
      element.addEventListener('change', applyFilters);
    }
  });

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');

  if (initialQuery && searchInput) {
    searchInput.value = initialQuery;
    applyFilters();
  }

  window.initMoviePlayer = function (videoUrl) {
    const video = document.getElementById('movie-player');
    const cover = document.getElementById('player-cover');
    const status = document.getElementById('player-status');
    let hls = null;
    let attached = false;

    if (!video || !cover || !videoUrl) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function attachSource() {
      if (attached) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          attached = true;
          setStatus('');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放暂时无法启动，请稍后再试。');
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
        return;
      }

      setStatus('播放暂时无法启动，请稍后再试。');
    }

    function playVideo() {
      cover.classList.add('is-hidden');
      setStatus('');
      attachSource();
      const promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          cover.classList.remove('is-hidden');
          setStatus('点击播放按钮开始观看。');
        });
      }
    }

    cover.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        cover.classList.remove('is-hidden');
      }
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
