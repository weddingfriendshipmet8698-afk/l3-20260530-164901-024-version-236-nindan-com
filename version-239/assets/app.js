(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        if (!button) {
            return;
        }
        button.addEventListener('click', function () {
            var opened = document.body.classList.toggle('nav-open');
            button.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    function initHero() {
        var hero = document.querySelector('.hero-slider');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-arrow.prev');
        var next = hero.querySelector('.hero-arrow.next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                var active = i === index;
                slide.classList.toggle('is-active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-target')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('.filter-scope'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('.filter-input');
            var yearInput = scope.querySelector('.filter-year');
            var selects = Array.prototype.slice.call(scope.querySelectorAll('.filter-select'));
            var items = Array.prototype.slice.call(scope.querySelectorAll('.filter-item'));
            var status = scope.querySelector('.filter-status');
            if (!items.length) {
                return;
            }

            function getValue(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }

            function apply() {
                var query = getValue(input);
                var year = getValue(yearInput);
                var typeValue = '';
                var regionValue = '';
                selects.forEach(function (select) {
                    var field = select.getAttribute('data-field');
                    if (field === 'type') {
                        typeValue = getValue(select);
                    }
                    if (field === 'region') {
                        regionValue = getValue(select);
                    }
                });
                var visible = 0;
                items.forEach(function (item) {
                    var search = (item.getAttribute('data-search') || '').toLowerCase();
                    var itemYear = (item.getAttribute('data-year') || '').toLowerCase();
                    var itemType = (item.getAttribute('data-type') || '').toLowerCase();
                    var itemRegion = (item.getAttribute('data-region') || '').toLowerCase();
                    var ok = true;
                    if (query && search.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (year && itemYear.indexOf(year) === -1) {
                        ok = false;
                    }
                    if (typeValue && itemType.indexOf(typeValue) === -1) {
                        ok = false;
                    }
                    if (regionValue && itemRegion.indexOf(regionValue) === -1) {
                        ok = false;
                    }
                    item.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (status) {
                    status.textContent = query || year || typeValue || regionValue ? '已匹配 ' + visible + ' 部影片' : '输入关键词即可快速定位影片';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (yearInput) {
                yearInput.addEventListener('input', apply);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', apply);
            });
        });
    }

    function initQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (!query) {
            return;
        }
        var input = document.querySelector('.filter-input');
        if (!input) {
            return;
        }
        input.value = query;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function initPlayer() {
        var wrap = document.querySelector('.player-wrap[data-video-src]');
        if (!wrap) {
            return;
        }
        var video = wrap.querySelector('video');
        var button = wrap.querySelector('.play-overlay');
        var source = wrap.getAttribute('data-video-src');
        var attached = false;
        var hls = null;

        function attachSource() {
            if (attached || !video || !source) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function startVideo() {
            attachSource();
            if (button) {
                button.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', startVideo);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startVideo();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove('is-hidden');
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initQuerySearch();
        initPlayer();
    });
})();
