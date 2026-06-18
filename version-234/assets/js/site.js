(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.dataset.heroDot || 0));
        startTimer();
      });
    });

    carousel.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });

    carousel.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applySearch(input) {
    const grid = document.querySelector(input.dataset.cardSearch);
    const resultCount = document.querySelector('[data-result-count]');

    if (!grid) {
      return;
    }

    const query = normalize(input.value);
    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    let visibleCount = 0;

    cards.forEach(function (card) {
      const text = normalize(card.dataset.filterText);
      const isVisible = !query || text.includes(query);
      card.hidden = !isVisible;

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = visibleCount + ' 部';
    }
  }

  document.querySelectorAll('[data-card-search]').forEach(function (input) {
    const queryKey = input.dataset.urlQuery;

    if (queryKey) {
      const params = new URLSearchParams(window.location.search);
      const queryValue = params.get(queryKey);

      if (queryValue) {
        input.value = queryValue;
      }
    }

    applySearch(input);

    input.addEventListener('input', function () {
      applySearch(input);
    });
  });

  const backToTop = document.querySelector('[data-back-to-top]');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 460);
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
