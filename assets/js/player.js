(function () {
  function setup(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('[data-play-overlay]');
    var src = box.getAttribute('data-stream');
    var started = false;
    var hls = null;

    if (!video || !src) {
      return;
    }

    function attach() {
      if (started) {
        return;
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (!started) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.player-box'), setup);
})();
