(function () {
  window.initMoviePlayer = function (url) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playOverlay');
    if (!video || !url) {
      return;
    }

    var hls = null;
    var attached = false;

    var attach = function () {
      if (attached) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        video.src = url;
      }
    };

    var hideOverlay = function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    };

    var start = function () {
      attach();
      hideOverlay();
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', hideOverlay);
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
