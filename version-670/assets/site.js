(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function() {
      document.body.classList.toggle("menu-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = hero.querySelector("[data-hero-dots]");
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function renderDots() {
      if (!dots) {
        return;
      }
      dots.innerHTML = "";
      slides.forEach(function(_, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换到第" + (index + 1) + "张");
        dot.addEventListener("click", function() {
          show(index);
          restart();
        });
        dots.appendChild(dot);
      });
    }

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      if (dots) {
        Array.prototype.slice.call(dots.children).forEach(function(dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }
    }

    function nextSlide() {
      show(current + 1);
    }

    function prevSlide() {
      show(current - 1);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(nextSlide, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function() {
        prevSlide();
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        nextSlide();
        restart();
      });
    }
    renderDots();
    show(0);
    restart();
  }

  function setupFilters() {
    var cardList = document.querySelector("[data-card-list]");
    if (!cardList) {
      return;
    }
    var input = document.querySelector("[data-search-input]");
    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var cards = Array.prototype.slice.call(cardList.querySelectorAll("[data-movie-card]"));
    var label = document.querySelector("[data-result-label]");

    function normalized(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalized(input ? input.value : "");
      var activeFilters = {};
      filters.forEach(function(select) {
        activeFilters[select.getAttribute("data-filter")] = select.value;
      });
      cards.forEach(function(card) {
        var haystack = normalized(card.getAttribute("data-search"));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesFilters = Object.keys(activeFilters).every(function(name) {
          return !activeFilters[name] || card.getAttribute("data-" + name) === activeFilters[name];
        });
        card.classList.toggle("is-hidden", !(matchesKeyword && matchesFilters));
      });
      if (label) {
        label.textContent = "筛选结果已更新";
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    filters.forEach(function(select) {
      select.addEventListener("change", apply);
    });
  }

  window.initMoviePlayer = function(videoUrl) {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var overlay = player.querySelector("[data-player-overlay]");
    var hlsPlayer = null;
    var initialized = false;
    var pendingPlay = false;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function initialize() {
      if (initialized) {
        return;
      }
      initialized = true;
      if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayer.loadSource(videoUrl);
        hlsPlayer.attachMedia(video);
        hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function() {
          if (pendingPlay) {
            playVideo();
          }
        });
        hlsPlayer.on(window.Hls.Events.ERROR, function(_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsPlayer.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsPlayer.recoverMediaError();
          } else {
            hlsPlayer.destroy();
          }
        });
      } else {
        video.src = videoUrl;
      }
    }

    function start() {
      pendingPlay = true;
      initialize();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (!hlsPlayer || video.readyState > 0) {
        playVideo();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function() {
      if (!initialized) {
        start();
      }
    });
    video.addEventListener("play", function() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function() {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
  };

  ready(function() {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
