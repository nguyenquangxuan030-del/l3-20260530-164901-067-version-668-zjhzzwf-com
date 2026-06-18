(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var navMenu = document.querySelector(".nav-menu");

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", function () {
        var open = navMenu.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });

      navMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          navMenu.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var activeIndex = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === activeIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === activeIndex);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          setSlide(activeIndex + 1);
        }, 5200);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setSlide(Number(dot.getAttribute("data-slide")) || 0);
        restartTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(activeIndex - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setSlide(activeIndex + 1);
        restartTimer();
      });
    }

    restartTimer();

    var searchInput = document.querySelector(".js-search");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-button"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));
    var currentFilter = "全部";

    function matchFilter(card) {
      if (currentFilter === "全部") {
        return true;
      }
      var type = card.getAttribute("data-card-type") || "";
      var region = card.getAttribute("data-card-region") || "";
      var text = card.getAttribute("data-card-search") || "";
      if (currentFilter === "海外") {
        return region.indexOf("国产") === -1 && region.indexOf("中国") === -1;
      }
      return type.indexOf(currentFilter) !== -1 || region.indexOf(currentFilter) !== -1 || text.indexOf(currentFilter) !== -1;
    }

    function applySearch() {
      var term = searchInput ? searchInput.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-card-search") || "").toLowerCase();
        var visible = (!term || text.indexOf(term) !== -1) && matchFilter(card);
        card.setAttribute("data-hidden", visible ? "false" : "true");
      });
    }

    if (searchInput && cards.length) {
      searchInput.addEventListener("input", applySearch);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentFilter = button.getAttribute("data-filter") || "全部";
        filterButtons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        applySearch();
      });
    });
  });
})();
