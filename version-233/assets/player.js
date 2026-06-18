(function () {
  window.initPlayer = function (source) {
    var video = document.getElementById("filmVideo");
    var overlay = document.querySelector("[data-player-overlay]");
    var playButton = document.querySelector("[data-play-button]");
    if (!video || !source) {
      return;
    }
    var started = false;
    function play() {
      if (started) {
        var again = video.play();
        if (again && typeof again.catch === "function") {
          again.catch(function () {});
        }
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add("hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        var nativePlay = video.play();
        if (nativePlay && typeof nativePlay.catch === "function") {
          nativePlay.catch(function () {});
        }
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          var hlsPlay = video.play();
          if (hlsPlay && typeof hlsPlay.catch === "function") {
            hlsPlay.catch(function () {});
          }
        });
        return;
      }
      video.src = source;
      var fallbackPlay = video.play();
      if (fallbackPlay && typeof fallbackPlay.catch === "function") {
        fallbackPlay.catch(function () {});
      }
    }
    if (playButton) {
      playButton.addEventListener("click", play);
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!started) {
        play();
      }
    });
  };
})();
