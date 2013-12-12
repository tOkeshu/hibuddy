(function() {
  var room = window.location.pathname.split('/')[2];
  var hibuddy = new HiBuddyApp(room);

  var localVideo  = document.getElementById('local-video');
  var remoteVideo = document.getElementById('remote-video');
  navigator.mozGetUserMedia({video: true, audio: true}, function(localStream) {
    localVideo.mozSrcObject = localStream;
    localVideo.play();

    hibuddy.start(localStream, function(remoteStream) {
      remoteVideo.mozSrcObject = remoteStream;
      remoteVideo.play();
    });

  }, function(err) {
    console.error("getUserMedia Failed");
  });

}());
