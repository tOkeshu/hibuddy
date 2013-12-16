/* globals EventSource, MicroEvent,
   mozRTCPeerConnection, mozRTCSessionDescription, mozRTCIceCandidate */

function HiBuddyToolbar(el, stream) {
  this.el = el;
  this.stream = stream;
  this.state = {
    video: true,
    audio: true,
    fullscreen: false,
  };

  this.video = this.el.querySelector(".video");
  this.video.addEventListener("click", this.toggleVideo.bind(this));
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
  }

  _muter: function(enabled) {
    return function(track) {
      track.enabled = enabled;
    }
  }
};

