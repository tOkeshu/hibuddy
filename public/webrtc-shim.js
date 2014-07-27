(function(window, navigator) {
  /* webrtc-shim.js A simple shim for WebRTC. - romain.gauthier@monkeypatch.me

     To the extent possible under law, the author(s) have dedicated
     all copyright and related and neighboring rights to this software
     to the public domain worldwide. This software is distributed
     without any warranty.

     You should have received a copy of the CC0 Public Domain
     Dedication along with this software. If not, see
     <http://creativecommons.org/publicdomain/zero/1.0/>.
  */

  navigator.getUserMedia = (navigator.getUserMedia       ||
                            navigator.mozGetUserMedia    ||
                            navigator.webkitGetUserMedia);
  window.RTCSessionDescription = (window.RTCSessionDescription    ||
                                  window.mozRTCSessionDescription ||
                                  window.webkitRTCSessionDescription);
  window.RTCIceCandidate = (window.RTCIceCandidate    ||
                            window.mozRTCIceCandidate ||
                            window.webkitRTCIceCandidate);
  window.RTCPeerConnection =  (window.RTCPeerConnection    ||
                               window.mozRTCPeerConnection ||
                               window.webkitRTCPeerConnection);
}(window, navigator));

