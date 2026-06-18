(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-main-menu]');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    setupHero();
    setupCardFilter();
    setupPlayer();
    setupGlobalSearch();
  });

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

    if (!slides.length) {
      return;
    }

    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupCardFilter() {
    var input = document.querySelector('[data-card-search]');
    var sort = document.querySelector('[data-card-sort]');
    var grid = document.querySelector('[data-card-grid]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var sortValue = sort ? sort.value : 'default';
      var visibleCards = cards.filter(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        return matched;
      });

      if (sortValue !== 'default') {
        visibleCards.sort(function (a, b) {
          if (sortValue === 'year-desc') {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }
          if (sortValue === 'views-desc') {
            return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
          }
          if (sortValue === 'title-asc') {
            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
          }
          return 0;
        });

        visibleCards.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (sort) {
      sort.addEventListener('change', apply);
    }
  }

  function setupPlayer() {
    var video = document.getElementById('moviePlayer');
    var trigger = document.querySelector('[data-play-trigger]');

    if (!video) {
      return;
    }

    var src = video.getAttribute('data-src');
    var initialized = false;

    function init() {
      if (initialized || !src) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      init();
      if (trigger) {
        trigger.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('hidden');
      }
    });

    video.addEventListener('click', init, { once: true });
  }

  function setupGlobalSearch() {
    var input = document.getElementById('globalSearch');
    var button = document.getElementById('globalSearchButton');
    var results = document.getElementById('searchResults');
    var heading = document.getElementById('searchHeading');

    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function posterFallbackPath() {
      return 'assets/img/poster-fallback.svg';
    }

    function makeCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="movie-cover" href="movie/' + movie.number + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">',
        '    <img src="' + movie.poster + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + posterFallbackPath() + '\';">',
        '    <span class="play-badge">▶</span>',
        '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
        '    <span class="score-badge">' + escapeHtml(movie.score) + '</span>',
        '  </a>',
        '  <div class="movie-info">',
        '    <h3><a href="movie/' + movie.number + '.html">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.desc) + '</p>',
        '    <div class="meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function runSearch() {
      var keyword = input.value.trim().toLowerCase();
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.desc, movie.region, movie.year, movie.genre, movie.category, movie.tags.join(' ')].join(' ').toLowerCase();
        return !keyword || text.indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (heading) {
        heading.textContent = keyword ? '搜索结果：' + matched.length + ' 条' : '热门影片';
      }

      results.innerHTML = matched.map(makeCard).join('');
    }

    input.addEventListener('input', runSearch);

    if (button) {
      button.addEventListener('click', runSearch);
    }

    if (initial) {
      runSearch();
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
})();
