/* globals EventSource, RSVP, _ , ScratchArea,
   mozRTCSessionDescription, mozRTCPeerConnection
 */
document.addEventListener('DOMContentLoaded', function() {
  var config = {
    iceServers: [{
      // please contact me if you plan to use this server
      url: 'turn:webrtc.monkeypatch.me:6424?transport=udp',
      credential: 'hibuddy',
      username: 'hibuddy'
    }]
  };
  var peerConnection = new mozRTCPeerConnection(config), dataChannel;
  var room           = window.location.pathname.split('/')[2];
  var source         = new EventSource("/rooms/" + room + "/signalling");
  var me, scratcharea;

  peerConnection.onaddstream = function(obj) {
    var remoteVideo = document.getElementById('remote-video');
    console.log(obj);

    // XXX should differenciate between video and audio
    // seems to be a regression in the API
    remoteVideo.mozSrcObject = obj.stream;
    remoteVideo.play();
  };

  peerConnection.oniceconnectionstatechange = function() {
    // TODO: display an error if the ice connection failed
    console.log("ice: " + peerConnection.iceConnectionState);
  };

  peerConnection.onicecandidate = function(event) {
    if (event.candidate) {
      var candidate = {
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex
      };
      post({type: 'iceCandidate', from: me, candidate: candidate});
    }
  };

  var post = function(data) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/rooms/' + room + '/signalling', true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(data));
  };

  var getVideoAudio = function(callback) {
    var localVideo = document.getElementById('local-video');

    navigator.mozGetUserMedia({video: true, audio: true}, function(stream) {
      localVideo.mozSrcObject = stream;
      localVideo.play();
      peerConnection.addStream(stream);

      callback();
    }, function(err) {
      callback(err);
    });
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
        post({type: 'answer', from: me, answer: answer});
      });
    }, function() {});
  });

  // XXX: handle errors
  getVideoAudio(function() {
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

    var offer = new mozRTCSessionDescription(event.offer);
    peerConnection.setRemoteDescription(offer, function() {
      sendAnswer();
    });
  });

  source.addEventListener('answer', function(event) {
    event = JSON.parse(event.data);
    console.log(event.answer);

    if (event.from === me)
      return;

    var answer = new mozRTCSessionDescription(event.answer);
    peerConnection.setRemoteDescription(answer, function() {
      console.log('done');
    });
  });

  source.addEventListener("iceCandidate", function(event) {
    event = JSON.parse(event.data);

    if (event.from === me)
      return;

    peerConnection.addIceCandidate(new mozRTCIceCandidate(event.candidate));
  });


  // Fullscreen
  function fullscren() { this.parentNode.mozRequestFullScreen(); }
  document.getElementById('local-video').addEventListener('click', fullscren);
  document.getElementById('remote-video').addEventListener('click', fullscren);

  dataChannel = peerConnection.createDataChannel('dc', {
    id: 0,
    negotiated: true,
    // Stream and preset parameters enable backwards compatibility
    // from Firefox 24 until bug 892441 is fixed.
    stream: 0,
    preset: true
  });

  scratcharea = new ScratchArea({
    node: document.querySelector("textarea"),
    transport: dataChannel
  });

  dataChannel.onopen = function() {
    scratcharea.node.removeAttribute("disabled");
    scratcharea.monitor();
  };

  dataChannel.onerror = function(e) {
    scratcharea.node.removeAttribute("disabled");
    scratcharea.stop();
    console.error("DataChannel Error: " + e);
  };

  dataChannel.onclose = function() {
    scratcharea.node.setAttribute("disabled", "disabled");
    scratcharea.stop();
  };

});

