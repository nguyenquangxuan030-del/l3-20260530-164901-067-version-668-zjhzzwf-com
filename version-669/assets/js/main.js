(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        restart();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var scope = panel.closest('main') || document;
        var input = panel.querySelector('[data-filter-input]');
        var year = panel.querySelector('[data-filter-year]');
        var type = panel.querySelector('[data-filter-type]');
        var category = panel.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var noResult = scope.querySelector('[data-no-result]');
        var urlQuery = new URLSearchParams(window.location.search).get('q');

        if (input && urlQuery) {
            input.value = urlQuery;
        }

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function filterCards() {
            var q = valueOf(input);
            var y = valueOf(year);
            var t = valueOf(type);
            var c = valueOf(category);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
                var match = (!q || haystack.indexOf(q) !== -1) &&
                    (!y || cardYear.indexOf(y) !== -1) &&
                    (!t || cardType.indexOf(t) !== -1) &&
                    (!c || cardCategory.indexOf(c) !== -1);

                card.style.display = match ? '' : 'none';

                if (match) {
                    visible += 1;
                }
            });

            if (noResult) {
                noResult.style.display = visible ? 'none' : 'block';
            }
        }

        [input, year, type, category].forEach(function (element) {
            if (element) {
                element.addEventListener('input', filterCards);
                element.addEventListener('change', filterCards);
            }
        });

        filterCards();
    });

    var homeSearch = document.querySelector('[data-home-search]');

    if (homeSearch) {
        homeSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = homeSearch.querySelector('input');
            var q = input ? input.value.trim() : '';
            window.location.href = './categories.html' + (q ? '?q=' + encodeURIComponent(q) : '');
        });
    }
}());
