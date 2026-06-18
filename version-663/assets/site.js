(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  var searchModal = document.querySelector('[data-search-modal]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');

  function openSearch() {
    if (!searchModal) {
      return;
    }
    searchModal.classList.add('open');
    searchModal.setAttribute('aria-hidden', 'false');
    setTimeout(function () {
      if (searchInput) {
        searchInput.focus();
      }
    }, 30);
  }

  function closeSearch() {
    if (!searchModal) {
      return;
    }
    searchModal.classList.remove('open');
    searchModal.setAttribute('aria-hidden', 'true');
  }

  function renderResults(query) {
    if (!searchResults) {
      return;
    }
    var q = query.trim().toLowerCase();
    var data = window.MOVIE_SEARCH_INDEX || [];
    if (!q) {
      searchResults.innerHTML = '<p class="empty-search">输入关键词后会显示匹配影片。</p>';
      return;
    }
    var results = data.filter(function (item) {
      var haystack = [
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        item.desc,
        (item.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).slice(0, 24);
    if (!results.length) {
      searchResults.innerHTML = '<p class="empty-search">没有找到匹配内容。</p>';
      return;
    }
    searchResults.innerHTML = results.map(function (item) {
      return '<a class="search-result" href="' + item.url + '">' +
        '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong>' +
        '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</span></span>' +
        '</a>';
    }).join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[char];
    });
  }

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-open-search]').forEach(function (button) {
    button.addEventListener('click', openSearch);
  });

  document.querySelectorAll('[data-close-search]').forEach(function (button) {
    button.addEventListener('click', closeSearch);
  });

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      renderResults(searchInput.value);
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
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

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    startHero();
  }

  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      restartHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      restartHero();
    });
  });

  showSlide(0);
  startHero();
})();
