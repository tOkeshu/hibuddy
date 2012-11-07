$(document).ready(function() {
    var localVideo = $('#local-video').get(0);
    var localAudio = $('#local-audio').get(0);
    var remoteVideo = $('#remote-video').get(0);
    var peerConnection = new mozRTCPeerConnection();
    var source = new EventSource("/signalling");

    source.addEventListener("uid", function(event) {
        event = JSON.parse(event.data);
        console.log('UID: ' + event.uid);

        // Get local video
        navigator.mozGetUserMedia({video: true}, function(stream) {
            localVideo.mozSrcObject = stream;
            localVideo.play();
            peerConnection.addStream(stream);

            // Get local audio
            navigator.mozGetUserMedia({audio: true},function(stream) {
                localAudio.mozSrcObject = stream;
                localAudio.play();
                peerConnection.addStream(stream);

                // Create offer
                peerConnection.createOffer(function(offer) {
                    peerConnection.setLocalDescription(offer, function() {
                        // Send offer
                    });
                });

            }, function() {});
        }, function() {});

    });

});

