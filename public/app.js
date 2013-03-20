document.addEventListener('DOMContentLoaded', function() {
    var peerConnection = new mozRTCPeerConnection();
    var room           = window.location.pathname.split('/')[2];
    var source         = new EventSource("/rooms/" + room + "/signalling");
    var me;

    peerConnection.onaddstream = function(obj) {
        var remoteVideo = document.getElementById('remote-video');
        var remoteAudio = document.getElementById('remote-audio');
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

    var post = function(data) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/rooms/' + room + '/signalling', true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(JSON.stringify(data));
    };

    var getVideo = function() {
        var promise = new RSVP.Promise();
        var localVideo = document.getElementById('local-video');

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
        var localAudio = document.getElementById('local-audio');

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
                post({type: 'offer', from: me, offer: offer});
            });
        }, function() {});
    });

    var sendAnswer, waitOffer;
    sendAnswer = waitOffer = _.after(2, function() {
        // Create answer
        peerConnection.createAnswer(function(answer) {
            peerConnection.setLocalDescription(answer, function() {
                // Send answer
                post({type: 'answer', from: me, answer: answer})
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

    // Fullscreen
    function fullscren() { this.parentNode.mozRequestFullScreen(); }
    document.getElementById('local-video').addEventListener('click', fullscren);
    document.getElementById('remote-video').addEventListener('click', fullscren);

    //Etherpad
    function add_etherpad() {
        etherpad_url = etherpadStatusParsed.base_url + '/p/' + room + '?showControls=false&showChat=false&showLineNumbers=true&useMonospaceFont=false';
        document.getElementById('etherpad').innerHTML = '<iframe id="etherpad-iframe" src="' + etherpad_url + '">';
    }

    function check_etherpad() {
        var etherpadStatus = new XMLHttpRequest();
        etherpadStatus.open("GET", '/etherpad/' + room, true);
        etherpadStatus.onreadystatechange = function() {
            if (etherpadStatus.readyState == 4) {
                if (etherpadStatus.status == 200) {
                    console.log(etherpadStatus.responseText);
                    etherpadStatusParsed = JSON.parse(etherpadStatus.responseText);
                    if (etherpadStatusParsed.code == 0) {
                        add_etherpad();
                    }
                }
            }
        };
        etherpadStatus.send(null);
    }

    document.getElementById('create_etherpad').addEventListener('click', add_etherpad);

    check_etherpad();

});

