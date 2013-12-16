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
  }
};

