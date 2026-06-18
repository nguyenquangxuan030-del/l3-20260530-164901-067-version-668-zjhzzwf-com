document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    function showSlide(target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);
    window.setInterval(function () {
      showSlide(index + 1);
    }, 5000);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterInput && filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (initialQuery) {
      filterInput.value = initialQuery;
    }

    function applyFilter() {
      var query = filterInput.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase() + ' ' + (card.getAttribute('data-title') || '').toLowerCase() + ' ' + (card.getAttribute('data-tags') || '').toLowerCase() + ' ' + (card.getAttribute('data-region') || '').toLowerCase() + ' ' + (card.getAttribute('data-year') || '').toLowerCase();
        card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
      });
    }

    filterInput.addEventListener('input', applyFilter);

    var filterForm = filterInput.closest('form');
    if (filterForm) {
      filterForm.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilter();
      });
    }

    applyFilter();
  }
});
