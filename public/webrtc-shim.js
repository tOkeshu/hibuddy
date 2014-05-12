(function(window, navigator) {
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

