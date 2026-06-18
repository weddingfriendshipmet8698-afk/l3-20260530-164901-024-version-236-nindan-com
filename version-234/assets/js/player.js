(function () {
  function writeMessage(box, message) {
    const messageNode = box.querySelector('.player-message');

    if (messageNode) {
      messageNode.textContent = message;
    }
  }

  function playVideo(video) {
    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  function setupPlayer(box) {
    const video = box.querySelector('video');
    const button = box.querySelector('.player-start');
    const source = box.dataset.hlsSource;

    if (!video || !button || !source) {
      return;
    }

    button.addEventListener('click', function () {
      button.classList.add('is-hidden');
      writeMessage(box, '正在加载播放源…');

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          writeMessage(box, '');
          playVideo(video);
        });

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            writeMessage(box, '播放源加载失败，请检查网络或稍后重试。');
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          writeMessage(box, '');
          playVideo(video);
        }, { once: true });
      } else {
        writeMessage(box, '当前浏览器不支持 HLS 播放，请更换现代浏览器访问。');
      }
    });
  }

  document.querySelectorAll('.player-box').forEach(setupPlayer);
})();
