$(document).ready(function() {
    var localVideo = $('#local-video').get(0);
    var localAudio = $('#local-audio').get(0);
    var remoteVideo = $('#remote-video').get(0);
    var remoteAudio = $('#remote-audio').get(0);
    var peerConnection = new mozRTCPeerConnection();
    var source = new EventSource("/signalling");
    var me;

    peerConnection.onaddstream = function(obj) {
        console.log(obj);
        var type = obj.type;
        if (type == "video") {
            remoteVideo.mozSrcObject = obj.stream;
            remoteVideo.play();
        } else if (type == "audio") {
            remoteAudio.mozSrcObject = obj.stream;
            remoteAudio.play();
        } else {
            console.log("sender onaddstream of unknown type, obj = " + obj.toSource());
        }
    };

    source.addEventListener("uid", function(event) {
        event = JSON.parse(event.data);
        me    = event.uid;
        console.log('UID: ' + me);

    });

    source.addEventListener("newfriend", function(event) {
        event = JSON.parse(event.data);

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
                        $.ajax({
                            type: 'POST',
                            url:  '/signalling',
                            data: {
                                type: 'offer',
                                from: me,
                                offer: offer
                            }
                        });
                    });
                });

            }, function() {});
        }, function() {});
    });

    source.addEventListener("offer", function(event) {
        event = JSON.parse(event.data);

        if (event.from == me)
            return;

        peerConnection.setRemoteDescription(event.offer, function() {

            // Get local video
            navigator.mozGetUserMedia({video: true, fake: true}, function(stream) {
                localVideo.mozSrcObject = stream;
                localVideo.play();
                peerConnection.addStream(stream);

                // Get local audio
                navigator.mozGetUserMedia({audio: true, fake: true},function(stream) {
                    localAudio.mozSrcObject = stream;
                    localAudio.play();
                    peerConnection.addStream(stream);

                    // Create offer
                    peerConnection.createAnswer(function(answer) {
                        peerConnection.setLocalDescription(answer, function() {
                            // Send offer
                            $.ajax({
                                type: 'POST',
                                url:  '/signalling',
                                data: {
                                    type: 'answer',
                                    from: me,
                                    answer: answer
                                }
                            });
                        });
                    }, function() {});
                }, function() {});
            }, function() {});
        });
    });

    source.addEventListener('answer', function(event) {
        event = JSON.parse(event.data);
        console.log(event.answer);

        peerConnection.setRemoteDescription(event.answer, function() {
            console.log('done');
        });
    });

});

