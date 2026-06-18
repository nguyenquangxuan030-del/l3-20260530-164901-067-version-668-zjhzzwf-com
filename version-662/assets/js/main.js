const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

ready(() => {
  const toggle = document.querySelector(".mobile-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      mobileNav.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  const prev = document.querySelector(".hero-prev");
  const next = document.querySelector(".hero-next");
  let current = 0;
  let timer = null;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };

  const startCarousel = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(() => showSlide(current + 1), 5200);
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startCarousel();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      showSlide(current - 1);
      startCarousel();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      showSlide(current + 1);
      startCarousel();
    });
  }

  startCarousel();

  const cards = Array.from(document.querySelectorAll(".movie-card"));
  const forms = Array.from(document.querySelectorAll(".site-search"));
  const inputs = forms
    .map((form) => form.querySelector('input[type="search"]'))
    .filter(Boolean);
  const yearFilter = document.querySelector(".year-filter");
  const chipFilters = Array.from(document.querySelectorAll(".chip-filter"));
  const noResult = document.querySelector(".no-result");
  let typeFilter = "";

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  if (initialQuery) {
    inputs.forEach((input) => {
      input.value = initialQuery;
    });
  }

  const normalize = (value) => String(value || "").trim().toLowerCase();

  const applyFilters = () => {
    if (!cards.length) {
      return;
    }
    const query = normalize(inputs[0] ? inputs[0].value : "");
    const year = yearFilter ? String(yearFilter.value || "") : "";
    let visible = 0;

    cards.forEach((card) => {
      const haystack = normalize(card.getAttribute("data-search"));
      const cardYear = String(card.getAttribute("data-year") || "");
      const cardType = String(card.getAttribute("data-type") || "");
      const matchedQuery = !query || haystack.includes(query);
      const matchedYear = !year || cardYear === year;
      const matchedType = !typeFilter || cardType === typeFilter;
      const matched = matchedQuery && matchedYear && matchedType;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (noResult) {
      noResult.classList.toggle("is-visible", visible === 0);
    }
  };

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (cards.length) {
        event.preventDefault();
        inputs.forEach((input) => {
          if (input !== form.querySelector('input[type="search"]')) {
            input.value = form.querySelector('input[type="search"]').value;
          }
        });
        applyFilters();
      }
    });
  });

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      inputs.forEach((target) => {
        if (target !== input) {
          target.value = input.value;
        }
      });
      applyFilters();
    });
  });

  if (yearFilter) {
    yearFilter.addEventListener("change", applyFilters);
  }

  chipFilters.forEach((button) => {
    button.addEventListener("click", () => {
      typeFilter = String(button.getAttribute("data-type-filter") || "");
      chipFilters.forEach((item) => item.classList.toggle("active", item === button));
      applyFilters();
    });
  });

  applyFilters();
});

export function initMoviePlayer(src, videoId) {
  const video = document.getElementById(videoId);
  if (!video) {
    return;
  }

  const wrap = video.closest(".player-wrap");
  const overlay = wrap ? wrap.querySelector(".player-overlay") : null;
  let attached = false;
  let attaching = null;
  let hls = null;

  const attach = () => {
    if (attached) {
      return Promise.resolve();
    }
    if (attaching) {
      return attaching;
    }

    attaching = new Promise((resolve) => {
      const finish = () => {
        attached = true;
        resolve();
      };

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        finish();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, finish);
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              video.src = src;
              finish();
            }
          }
        });
        window.setTimeout(finish, 1500);
        return;
      }

      video.src = src;
      finish();
    });

    return attaching;
  };

  const play = async () => {
    await attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    try {
      await video.play();
    } catch (error) {
      video.controls = true;
    }
  };

  if (overlay) {
    overlay.addEventListener("click", play);
  }

  video.addEventListener("play", () => {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("click", () => {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
    }
  });
}
