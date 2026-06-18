(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
    var index = 0;
    var timer = null;

    function showSlide(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var next = Number(thumb.getAttribute('data-hero-thumb')) || 0;
        showSlide(next);
        stop();
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  var input = document.querySelector('[data-filter-input]');
  var category = document.querySelector('[data-filter-category]');
  var year = document.querySelector('[data-filter-year]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyQueryFromUrl() {
    if (!input || !window.URLSearchParams) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
    }
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }
    var q = normalize(input ? input.value : '');
    var c = normalize(category ? category.value : '');
    var y = normalize(year ? year.value : '');

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matched = true;

      if (q && text.indexOf(q) === -1) {
        matched = false;
      }
      if (c && cardCategory !== c) {
        matched = false;
      }
      if (y && cardYear !== y) {
        matched = false;
      }
      card.classList.toggle('is-filtered-out', !matched);
    });
  }

  applyQueryFromUrl();
  [input, category, year].forEach(function (el) {
    if (el) {
      el.addEventListener('input', filterCards);
      el.addEventListener('change', filterCards);
    }
  });
  filterCards();
})();
