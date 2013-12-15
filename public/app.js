(function() {
  var room = window.location.pathname.split('/')[2];
  var hibuddy = new HiBuddyApp(room);

  var localVideo  = document.getElementById('local-video');
  var remoteVideo = document.getElementById('remote-video');
  var allowMedia  = document.getElementById('allow-media');
  var shareUrl    = document.getElementById('share-url');
  var connecting  = document.getElementById('connecting');
  var error       = document.getElementById('error');

  shareUrl.querySelector("input").value = window.location;

  function display(element) {
    var elements = [allowMedia, shareUrl, connecting, remoteVideo, error];
    elements.forEach(function(elem) {
      if (element !== elem)
        elem.classList.add("hidden");
    });
    element.classList.remove("hidden");
  }

  hibuddy.on("newbuddy", display.bind(this, connecting));
  hibuddy.on("connected", function() {
    display(remoteVideo);
  });
  hibuddy.on("failure", function(failure) {
    error.textContent = failure;
    display(error);
  });

  display(allowMedia);

  navigator.mozGetUserMedia({video: true, audio: true}, function(localStream) {
    localVideo.mozSrcObject = localStream;
    localVideo.play();

    hibuddy.start(localStream, function(remoteStream) {
      remoteVideo.mozSrcObject = remoteStream;
      remoteVideo.play();
    });

    display(shareUrl);
  }, function(err) {
    console.error("getUserMedia Failed");
  });

}());
