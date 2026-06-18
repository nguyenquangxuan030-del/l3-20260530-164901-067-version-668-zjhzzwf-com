(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function text(value) {
    return String(value || '').toLowerCase();
  }

  function matchesYear(card, value) {
    if (!value) {
      return true;
    }
    var year = Number(card.getAttribute('data-year'));
    if (value === 'older') {
      return year < 2020;
    }
    return year === Number(value);
  }

  ready(function () {
    document.querySelectorAll('[data-menu-button]').forEach(function (button) {
      button.addEventListener('click', function () {
        var nav = document.querySelector('[data-mobile-nav]');
        if (nav) {
          nav.classList.toggle('open');
        }
      });
    });

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
      var input = form.querySelector('[data-filter-keyword]');
      var category = form.querySelector('[data-filter-category]');
      var year = form.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
      var empty = document.querySelector('[data-empty-state]');

      function applyFilters() {
        var query = text(input && input.value);
        var categoryValue = category ? category.value : '';
        var yearValue = year ? year.value : '';
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = text([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-category'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year')
          ].join(' '));
          var ok = true;

          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (categoryValue && card.getAttribute('data-category') !== categoryValue) {
            ok = false;
          }
          if (!matchesYear(card, yearValue)) {
            ok = false;
          }

          card.hidden = !ok;
          if (ok) {
            shown += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', shown === 0);
        }
      }

      [input, category, year].forEach(function (element) {
        if (element) {
          element.addEventListener('input', applyFilters);
          element.addEventListener('change', applyFilters);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var keyword = params.get('q');
      if (keyword && input) {
        input.value = keyword;
      }
      applyFilters();
    });

    document.querySelectorAll('[data-video-box]').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-video-button]');

      function begin() {
        if (!video) {
          return;
        }
        var url = video.getAttribute('data-stream');
        if (!url) {
          return;
        }
        box.classList.add('is-started');

        if (window.Hls && window.Hls.isSupported()) {
          if (!video._hlsPlayer) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            video._hlsPlayer = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.play().catch(function () {});
          }
        } else {
          if (!video.getAttribute('src')) {
            video.setAttribute('src', url);
          }
          video.play().catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          begin();
        });
      }

      box.addEventListener('click', function (event) {
        if (event.target === video && box.classList.contains('is-started')) {
          return;
        }
        begin();
      });
    });
  });
})();
