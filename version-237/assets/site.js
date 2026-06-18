(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("open") ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));

    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function setSlide(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("active", position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        setSlide(position);
        start();
      });
    });

    setSlide(0);
    start();
  }

  function initBrowse() {
    var grid = document.querySelector("[data-filter-grid]");

    if (!grid) {
      return;
    }

    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-sort-select]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-filter-card]"));
    var activeCategory = "all";
    var params = new URLSearchParams(window.location.search);
    var incoming = params.get("q") || "";

    if (input && incoming) {
      input.value = incoming;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-text"));
        var category = card.getAttribute("data-category") || "";
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchCategory = activeCategory === "all" || category === activeCategory;
        card.hidden = !(matchQuery && matchCategory);
      });
    }

    function sortCards() {
      var mode = select ? select.value : "default";
      var sorted = cards.slice();

      if (mode === "hot") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-hot")) - Number(a.getAttribute("data-hot"));
        });
      }

      if (mode === "year") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      }

      if (mode === "title") {
        sorted.sort(function (a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        });
      }

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCategory = chip.getAttribute("data-filter-chip") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        apply();
      });
    });

    if (input) {
      input.addEventListener("input", apply);
    }

    if (select) {
      select.addEventListener("change", function () {
        sortCards();
        apply();
      });
    }

    sortCards();
    apply();
  }

  function initPlayer() {
    var video = document.getElementById("movie-player");
    var button = document.querySelector("[data-play-button]");

    if (!video) {
      return;
    }

    var url = window.currentVideoUrl || video.getAttribute("data-video") || "";
    var hls = null;
    var loaded = false;

    function load() {
      if (loaded || !url) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          hls.destroy();
        });
        return;
      }

      video.src = url;
    }

    function start() {
      load();
      if (button) {
        button.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initBrowse();
    initPlayer();
  });
})();
