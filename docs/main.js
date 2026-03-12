/* ============================================
   VQA Research Project — Scroll-Driven Video
   Videos scrub with scroll position.
   Click any video to play/pause at 0.5x speed.
   ============================================ */

(function () {
  'use strict';

  var wraps = document.querySelectorAll('.scroll-video-wrap');
  var playing = new WeakSet(); // tracks click-to-play state

  /* --- Set container height based on video duration --- */
  wraps.forEach(function (wrap) {
    var video = wrap.querySelector('video');
    if (!video) return;

    video.addEventListener('loadedmetadata', function () {
      // ~25vh per second of video, clamped to 200–500vh
      var vh = Math.max(200, Math.min(500, Math.round(video.duration * 25)));
      wrap.style.height = vh + 'vh';
    });

    /* --- Click to play/pause at 0.5x (fallback) --- */
    video.addEventListener('click', function () {
      if (playing.has(video)) {
        video.pause();
        playing.delete(video);
      } else {
        video.playbackRate = 0.5;
        video.play();
        playing.add(video);
      }
    });
  });

  /* --- Scroll-driven scrubbing --- */
  var ticking = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(scrub);
      ticking = true;
    }
  }, { passive: true });

  function scrub() {
    ticking = false;
    var vh = window.innerHeight;

    wraps.forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var fill = wrap.querySelector('.scroll-progress-fill');
      var hint = wrap.querySelector('.scroll-hint');
      if (!video || !video.duration) return;

      // Skip scroll scrubbing if user clicked play
      if (playing.has(video)) {
        if (fill) fill.style.width = (video.currentTime / video.duration * 100) + '%';
        return;
      }

      var rect = wrap.getBoundingClientRect();
      var scrollRange = wrap.offsetHeight - vh;
      if (scrollRange <= 0) return;

      var progress = Math.max(0, Math.min(1, -rect.top / scrollRange));
      video.currentTime = progress * video.duration;

      if (fill) fill.style.width = (progress * 100) + '%';
      if (hint) hint.style.opacity = progress > 0.02 ? '0' : '1';
    });
  }

  /* --- Update progress bar during click-to-play --- */
  wraps.forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var fill = wrap.querySelector('.scroll-progress-fill');
    if (!video || !fill) return;

    video.addEventListener('timeupdate', function () {
      if (playing.has(video) && video.duration) {
        fill.style.width = (video.currentTime / video.duration * 100) + '%';
      }
    });

    video.addEventListener('ended', function () {
      playing.delete(video);
    });
  });
})();
