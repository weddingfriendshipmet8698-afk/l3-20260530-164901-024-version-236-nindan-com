async function prepareVideo(video, message) {
  if (video.dataset.ready === 'true') {
    return true;
  }

  var source = video.dataset.src;

  if (!source) {
    message.textContent = '当前影片暂未配置播放源。';
    return false;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.dataset.ready = 'true';
    return true;
  }

  try {
    var module = await import('./hls-dru42stk.js');
    var Hls = module.H;

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.dataset.ready = 'true';
      return true;
    }
  } catch (error) {
    message.textContent = '播放器正在尝试使用浏览器原生模式播放。';
  }

  video.src = source;
  video.dataset.ready = 'true';
  return true;
}

function initializePlayer(shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('[data-play-button]');
  var message = shell.querySelector('[data-player-message]');

  if (!video || !button || !message) {
    return;
  }

  async function play() {
    button.disabled = true;
    message.textContent = '正在加载播放源...';

    var ready = await prepareVideo(video, message);

    if (!ready) {
      button.disabled = false;
      return;
    }

    video.controls = true;
    shell.classList.add('is-playing');
    message.textContent = '';

    try {
      await video.play();
    } catch (error) {
      shell.classList.remove('is-playing');
      button.disabled = false;
      message.textContent = '浏览器阻止了自动播放，请再次点击播放按钮。';
    }
  }

  button.addEventListener('click', play);
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(initializePlayer);
});
