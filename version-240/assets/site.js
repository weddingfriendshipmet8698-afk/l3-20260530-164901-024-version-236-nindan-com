(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initializeMobileNavigation() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initializeHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function initializeFeaturedCarousel() {
    var carousel = document.querySelector('[data-featured]');

    if (!carousel) {
      return;
    }

    var slides = selectAll('[data-featured-slide]', carousel);
    var previous = document.querySelector('[data-featured-prev]');
    var next = document.querySelector('[data-featured-next]');
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 6000);
    }
  }

  function populateSelect(select, values) {
    if (!select) {
      return;
    }

    var current = select.value;
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
    select.value = current;
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    });
  }

  function initializeLocalFilters() {
    selectAll('[data-filter-scope]').forEach(function (scope) {
      var panel = scope.querySelector('[data-local-filter]');
      var cards = selectAll('.movie-card', scope);

      if (!panel || !cards.length) {
        return;
      }

      var input = panel.querySelector('[data-filter-input]');
      var year = panel.querySelector('[data-filter-year]');
      var region = panel.querySelector('[data-filter-region]');
      var genre = panel.querySelector('[data-filter-genre]');

      populateSelect(year, uniqueSorted(cards.map(function (card) { return card.dataset.year; })));
      populateSelect(region, uniqueSorted(cards.map(function (card) { return card.dataset.region; })));
      populateSelect(genre, uniqueSorted(cards.flatMap(function (card) {
        return (card.dataset.genre || '').split(/\s+/);
      })));

      function applyFilter() {
        var keyword = (input && input.value || '').trim().toLowerCase();
        var selectedYear = year && year.value;
        var selectedRegion = region && region.value;
        var selectedGenre = genre && genre.value;

        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.type,
            card.dataset.tags
          ].join(' ').toLowerCase();
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedYear && card.dataset.year !== selectedYear) {
            matched = false;
          }
          if (selectedRegion && card.dataset.region !== selectedRegion) {
            matched = false;
          }
          if (selectedGenre && (card.dataset.genre || '').split(/\s+/).indexOf(selectedGenre) === -1) {
            matched = false;
          }

          card.classList.toggle('hidden', !matched);
        });
      }

      [input, year, region, genre].forEach(function (element) {
        if (element) {
          element.addEventListener('input', applyFilter);
          element.addEventListener('change', applyFilter);
        }
      });
    });
  }

  function initializeSearchPage() {
    var app = document.querySelector('[data-search-app]');
    var data = window.MOVIE_SEARCH_DATA || [];

    if (!app || !data.length) {
      return;
    }

    var input = app.querySelector('[data-search-input]');
    var region = app.querySelector('[data-search-region]');
    var genre = app.querySelector('[data-search-genre]');
    var year = app.querySelector('[data-search-year]');
    var status = app.querySelector('[data-search-status]');
    var results = app.querySelector('[data-search-results]');
    var loadMore = app.querySelector('[data-load-more]');
    var limit = 48;

    populateSelect(region, uniqueSorted(data.map(function (item) { return item.region; })));
    populateSelect(genre, uniqueSorted(data.flatMap(function (item) { return item.genres || []; })));
    populateSelect(year, uniqueSorted(data.map(function (item) { return item.year; })));

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function cardTemplate(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      var genres = (item.genres || []).slice(0, 3).join(' / ');
      return '' +
        '<article class="movie-card" data-title="' + escapeHtml(item.title) + '">' +
        '  <a href="' + escapeHtml(item.url) + '" class="movie-card-link">' +
        '    <div class="movie-poster">' +
        '      <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.classList.add(\'image-missing\');" />' +
        '      <div class="poster-shade"></div>' +
        '      <span class="poster-year">' + escapeHtml(item.year) + '</span>' +
        '      <span class="poster-play">播放</span>' +
        '    </div>' +
        '    <div class="movie-card-body">' +
        '      <div class="movie-meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
        '      <h3>' + escapeHtml(item.title) + '</h3>' +
        '      <p>' + escapeHtml(item.oneLine || item.summary || '') + '</p>' +
        '      <div class="movie-tags">' + tags + '</div>' +
        '      <div class="movie-genre">' + escapeHtml(genres) + '</div>' +
        '    </div>' +
        '  </a>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function applySearch() {
      var keyword = (input.value || '').trim().toLowerCase();
      var selectedRegion = region.value;
      var selectedGenre = genre.value;
      var selectedYear = year.value;

      var matched = data.filter(function (item) {
        var haystack = [
          item.title,
          item.region,
          item.type,
          item.year,
          (item.genres || []).join(' '),
          (item.tags || []).join(' '),
          item.oneLine,
          item.summary
        ].join(' ').toLowerCase();

        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (selectedRegion && item.region !== selectedRegion) {
          return false;
        }
        if (selectedGenre && (item.genres || []).indexOf(selectedGenre) === -1) {
          return false;
        }
        if (selectedYear && item.year !== selectedYear) {
          return false;
        }
        return true;
      });

      status.textContent = matched.length ? '已匹配相关影片，点击卡片可进入播放页。' : '没有找到匹配内容，请更换关键词或筛选条件。';
      results.innerHTML = matched.slice(0, limit).map(cardTemplate).join('');
      loadMore.hidden = matched.length <= limit;
      loadMore.onclick = function () {
        limit += 48;
        results.innerHTML = matched.slice(0, limit).map(cardTemplate).join('');
        loadMore.hidden = matched.length <= limit;
      };
    }

    [input, region, genre, year].forEach(function (element) {
      element.addEventListener('input', function () {
        limit = 48;
        applySearch();
      });
      element.addEventListener('change', function () {
        limit = 48;
        applySearch();
      });
    });

    applySearch();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initializeMobileNavigation();
    initializeHero();
    initializeFeaturedCarousel();
    initializeLocalFilters();
    initializeSearchPage();
  });
})();
