(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupGlobalSearch() {
    Array.prototype.slice.call(document.querySelectorAll("[data-global-search]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = value ? target + "?q=" + encodeURIComponent(value) : target;
      });
    });
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!panel || !cards.length) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-keyword]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var region = panel.querySelector("[data-filter-region]");
    var empty = document.querySelector("[data-no-result]");
    var params = new URLSearchParams(window.location.search);
    if (keyword && params.get("q")) {
      keyword.value = params.get("q");
    }
    function apply() {
      var q = normalize(keyword && keyword.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var r = normalize(region && region.value);
      var visible = 0;
      cards.forEach(function (card) {
        var blob = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type
        ].join(" "));
        var ok = true;
        if (q && blob.indexOf(q) === -1) {
          ok = false;
        }
        if (y && normalize(card.dataset.year) !== y) {
          ok = false;
        }
        if (t && normalize(card.dataset.type) !== t) {
          ok = false;
        }
        if (r && normalize(card.dataset.region) !== r) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    [keyword, year, type, region].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupGlobalSearch();
    setupFilters();
  });
})();
