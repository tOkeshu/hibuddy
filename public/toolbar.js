/* globals EventSource, MicroEvent */

function HiBuddyToolbar(el, stream) {
  this.el = el;
  this.stream = stream;
  this.state = {
    video: true,
    audio: true,
    fullscreen: false,
  };

  this.video = this.el.querySelector(".video");
  this.audio = this.el.querySelector(".audio");
  this.fullscreen = this.el.querySelector(".fullscreen");

  this.video.addEventListener("click", this.toggleVideo.bind(this));
  this.audio.addEventListener("click", this.toggleAudio.bind(this));
  this.fullscreen.addEventListener("click", this.toggleFullscreen.bind(this));
  document.addEventListener("mozfullscreenchange",
                            this.onFullscreenExit.bind(this));
}

HiBuddyToolbar.prototype = {
  toggleVideo: function(event) {
    event.preventDefault();
    this.state.video = !this.state.video;

    if (this.state.video) {
      this.video.classList.remove("disabled");
      this.video.classList.add("enabled");
    } else {
      this.video.classList.remove("enabled");
      this.video.classList.add("disabled");
    }
    this.stream.getVideoTracks().forEach(this._muter(this.state.video), this);
  },

  toggleAudio: function(event) {
    event.preventDefault();
    this.state.audio = !this.state.audio;

    if (this.state.audio) {
      this.audio.classList.remove("disabled");
      this.audio.classList.add("enabled");
    } else {
      this.audio.classList.remove("enabled");
      this.audio.classList.add("disabled");
    }
    this.stream.getAudioTracks().forEach(this._muter(this.state.audio), this);
  },

  _muter: function(enabled) {
    return function(track) {
      track.enabled = enabled;
    }
  },

  toggleFullscreen: function(event) {
    event.preventDefault();
    this.state.fullscreen = !this.state.fullscreen;

    if (this.state.fullscreen) {
      this.fullscreen.classList.remove("disabled");
      this.fullscreen.classList.add("enabled");
      document.querySelector("body").mozRequestFullScreen();
    } else {
      this.fullscreen.classList.remove("enabled");
      this.fullscreen.classList.add("disabled");
      document.mozCancelFullScreen();
    }
  },

  onFullscreenExit: function() {
    if (document.mozFullScreenElement)
      return;

    this.state.fullscreen = false;
    this.fullscreen.classList.remove("enabled");
    this.fullscreen.classList.add("disabled");
  }
};

