(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function bindHeader() {
    var header = document.querySelector("[data-site-header]");
    var button = document.querySelector("[data-mobile-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");

    function updateHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 36) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (button && panel) {
      button.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll(".js-header-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "./search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function bindHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function bindLocalSearch() {
    document.querySelectorAll("[data-local-search]").forEach(function (input) {
      var selector = input.getAttribute("data-local-search");
      var grid = document.querySelector(selector);
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search-card]"));
      var empty = document.querySelector("[data-empty-state]");

      function apply() {
        var keyword = normalize(input.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-meta"));
          var matched = !keyword || text.indexOf(keyword) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      input.addEventListener("input", apply);
      apply();
    });
  }

  function bindSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var results = document.querySelector("[data-search-results]");
    if (!form || !results) {
      return;
    }
    var cards = Array.prototype.slice.call(results.querySelectorAll("[data-search-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var q = form.querySelector("[name='q']");
    var category = form.querySelector("[name='category']");
    var type = form.querySelector("[name='type']");
    var year = form.querySelector("[name='year']");

    if (q) {
      q.value = params.get("q") || "";
    }
    if (category) {
      category.value = params.get("category") || "";
    }
    if (type) {
      type.value = params.get("type") || "";
    }
    if (year) {
      year.value = params.get("year") || "";
    }

    function apply() {
      var keyword = normalize(q && q.value);
      var categoryValue = normalize(category && category.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-meta"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (categoryValue && cardCategory !== categoryValue) {
          matched = false;
        }
        if (typeValue && cardType !== typeValue) {
          matched = false;
        }
        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
    form.addEventListener("input", apply);
    form.addEventListener("change", apply);
    apply();
  }

  window.initPlayer = function (videoId, overlayId, buttonId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var prepared = false;

    function prepare() {
      if (!video || prepared) {
        return;
      }
      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        return;
      }

      video.src = source;
    };

    function start() {
      if (!video) {
        return;
      }
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      prepare();
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    }
  };

  ready(function () {
    bindHeader();
    bindHero();
    bindLocalSearch();
    bindSearchPage();
  });
})();
