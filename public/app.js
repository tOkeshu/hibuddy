$(document).ready(function() {
    var peerConnection = new mozRTCPeerConnection();
    var room           = window.location.pathname.split('/')[2];
    var source         = new EventSource("/rooms/" + room + "/signalling");
    var me;

    peerConnection.onaddstream = function(obj) {
        var remoteVideo = $('#remote-video').get(0);
        var remoteAudio = $('#remote-audio').get(0);
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

    var getVideo = function() {
        var promise = new RSVP.Promise();
        var localVideo = $('#local-video').get(0);

        navigator.mozGetUserMedia({video: true}, function(stream) {
            localVideo.mozSrcObject = stream;
            localVideo.play();
            peerConnection.addStream(stream);

            promise.resolve();
        }, function(err) {
            promise.reject(err);
        });

        return promise
    }

    var getAudio = function() {
        var promise = new RSVP.Promise();
        var localAudio = $('#local-audio').get(0);

        navigator.mozGetUserMedia({audio: true}, function(stream) {
            localAudio.mozSrcObject = stream;
            localAudio.play();
            peerConnection.addStream(stream);

            promise.resolve();
        }, function(err) {
            promise.reject(err);
        });

        return promise
    };

    var sendOffer, waitFriend;
    sendOffer = waitFriend = _.after(2, function() {
        // Create offer
        peerConnection.createOffer(function(offer) {
            peerConnection.setLocalDescription(offer, function() {
                // Send offer
                $.ajax({
                    type: 'POST',
                    url:  '/rooms/' + room + '/signalling',
                    data: {
                        type: 'offer',
                        from: me,
                        offer: offer
                    }
                });
            });
        }, function() {});
    });

    var sendAnswer, waitOffer;
    sendAnswer = waitOffer = _.after(2, function() {
        // Create answer
        peerConnection.createAnswer(function(answer) {
            peerConnection.setLocalDescription(answer, function() {
                // Send answer
                $.ajax({
                    type: 'POST',
                    url:  '/rooms/' + room + '/signalling',
                    data: {
                        type: 'answer',
                        from: me,
                        answer: answer
                    }
                });
            });
        }, function() {});
    });

    getVideo().then(getAudio).then(function() {
        waitFriend();
        waitOffer();
    });

    source.addEventListener("uid", function(event) {
        event = JSON.parse(event.data);
        me    = event.uid;
        console.log('UID: ' + me);

    });

    source.addEventListener("newfriend", function(event) {
        event = JSON.parse(event.data);
        sendOffer();
    });

    source.addEventListener("offer", function(event) {
        event = JSON.parse(event.data);

        if (event.from === me)
            return;

        peerConnection.setRemoteDescription(event.offer, function() {
            sendAnswer();
        });
    });

    source.addEventListener('answer', function(event) {
        event = JSON.parse(event.data);
        console.log(event.answer);

        if (event.from === me)
            return;

        peerConnection.setRemoteDescription(event.answer, function() {
            console.log('done');
        });
    });

});

