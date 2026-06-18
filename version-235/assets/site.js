(function () {
  var menuButtons = document.querySelectorAll('[data-menu-toggle]');

  menuButtons.forEach(function (button) {
    var header = button.closest('.site-header');
    var panel = header ? header.querySelector('[data-nav-panel]') : null;

    if (!panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var setSlide = function (next) {
      current = (next + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === current);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
      });
    };

    if (slides.length > 1) {
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          setSlide(index);
        });
      });

      window.setInterval(function () {
        setSlide(current + 1);
      }, 6200);
    }
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    var input = searchPage.querySelector('[data-search-input]');
    var category = searchPage.querySelector('[data-category-filter]');
    var type = searchPage.querySelector('[data-type-filter]');
    var year = searchPage.querySelector('[data-year-filter]');
    var empty = searchPage.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(searchPage.querySelectorAll('[data-search-card]'));

    var normalize = function (value) {
      return String(value || '').trim().toLowerCase();
    };

    var matchesYear = function (cardYear, selected) {
      if (!selected) {
        return true;
      }

      var numericYear = parseInt(cardYear, 10);

      if (!numericYear) {
        return selected === 'other';
      }

      if (selected === '2025-plus') {
        return numericYear >= 2025;
      }

      if (selected === '2020-2024') {
        return numericYear >= 2020 && numericYear <= 2024;
      }

      if (selected === '2010-2019') {
        return numericYear >= 2010 && numericYear <= 2019;
      }

      if (selected === 'classic') {
        return numericYear < 2010;
      }

      return true;
    };

    var updateSearch = function () {
      var keyword = normalize(input ? input.value : '');
      var selectedCategory = category ? category.value : '';
      var selectedType = type ? type.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search-text'));
        var cardCategory = card.getAttribute('data-category') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (selectedCategory && selectedCategory !== cardCategory) {
          matched = false;
        }

        if (selectedType && selectedType !== cardType) {
          matched = false;
        }

        if (!matchesYear(cardYear, selectedYear)) {
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
    };

    [input, category, type, year].forEach(function (field) {
      if (field) {
        field.addEventListener('input', updateSearch);
        field.addEventListener('change', updateSearch);
      }
    });

    updateSearch();
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-button]');
    var stream = player.getAttribute('data-video');
    var hlsInstance = null;

    var attachStream = function () {
      if (!video || !stream || video.getAttribute('data-ready') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', 'true');
    };

    var startPlayback = function () {
      attachStream();

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };

    if (overlay && video) {
      overlay.addEventListener('click', startPlayback);
      overlay.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          startPlayback();
        }
      });
    }

    if (video) {
      video.addEventListener('play', attachStream, { once: true });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }
})();
