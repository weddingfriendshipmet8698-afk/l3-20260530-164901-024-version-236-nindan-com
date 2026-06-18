(function () {
  var header = document.querySelector('[data-site-header]');
  var toggle = document.querySelector('[data-menu-toggle]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function () {
      if (header) {
        header.classList.remove('menu-open');
      }
    });
  });

  function initSearchPage() {
    var grid = document.querySelector('[data-search-grid]');
    if (!grid) {
      return;
    }

    var input = document.querySelector('[data-search-input]');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-category-filter]'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-search-empty]');
    var params = new URLSearchParams(window.location.search);
    var activeCategory = params.get('category') || 'all';
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    function setActiveButton() {
      buttons.forEach(function (button) {
        if (button.getAttribute('data-category-filter') === activeCategory) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    }

    function filterCards() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var category = card.getAttribute('data-category') || '';
        var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
        var categoryMatch = activeCategory === 'all' || category === activeCategory;

        if (keywordMatch && categoryMatch) {
          card.classList.remove('hidden-card');
          visible += 1;
        } else {
          card.classList.add('hidden-card');
        }
      });

      if (empty) {
        if (visible === 0) {
          empty.classList.add('visible');
        } else {
          empty.classList.remove('visible');
        }
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-category-filter') || 'all';
        setActiveButton();
        filterCards();
      });
    });

    if (input) {
      input.addEventListener('input', filterCards);
    }

    setActiveButton();
    filterCards();
  }

  function initPlayers() {
    document.querySelectorAll('[data-video-src]').forEach(function (player) {
      var video = player.querySelector('video');
      var source = player.getAttribute('data-video-src');
      var centerButton = player.querySelector('.player-center-button');
      var playButton = player.querySelector('.control-play');
      var muteButton = player.querySelector('.control-mute');
      var fullButton = player.querySelector('.control-fullscreen');
      var status = player.querySelector('.player-status');

      if (!video || !source) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        player.hlsInstance = hls;
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('准备播放');
        });
        hls.on(window.Hls.Events.ERROR, function () {
          setStatus('视频加载中');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      function refreshPlayingState() {
        if (video.paused) {
          player.classList.remove('is-playing');
          setStatus('准备播放');
        } else {
          player.classList.add('is-playing');
          setStatus('正在播放');
        }
      }

      function togglePlay() {
        if (video.paused) {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              setStatus('点击播放');
            });
          }
        } else {
          video.pause();
        }
      }

      if (centerButton) {
        centerButton.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          togglePlay();
        });
      }

      if (playButton) {
        playButton.addEventListener('click', function (event) {
          event.preventDefault();
          togglePlay();
        });
      }

      if (muteButton) {
        muteButton.addEventListener('click', function (event) {
          event.preventDefault();
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? '开声' : '静音';
        });
      }

      if (fullButton) {
        fullButton.addEventListener('click', function (event) {
          event.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }

      video.addEventListener('click', togglePlay);
      video.addEventListener('play', refreshPlayingState);
      video.addEventListener('pause', refreshPlayingState);
      video.addEventListener('waiting', function () {
        setStatus('视频加载中');
      });
      video.addEventListener('canplay', refreshPlayingState);
      video.addEventListener('error', function () {
        setStatus('视频加载失败');
      });
    });
  }

  initSearchPage();
  initPlayers();
})();
