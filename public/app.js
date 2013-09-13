/* globals EventSource, RSVP, _ , ScratchArea,
   mozRTCSessionDescription, mozRTCPeerConnection
 */
document.addEventListener('DOMContentLoaded', function() {
  var peerConnection = new mozRTCPeerConnection(), dataChannel;
  var room           = window.location.pathname.split('/')[2];
  var source         = new EventSource("/rooms/" + room + "/signalling");
  var me, scratcharea;
  var etherpadStatusParsed;

  peerConnection.onaddstream = function(obj) {
    var remoteVideo = document.getElementById('remote-video');
    console.log(obj);

    // XXX should differenciate between video and audio
    // seems to be a regression in the API
    remoteVideo.mozSrcObject = obj.stream;
    remoteVideo.play();
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

  // Fullscreen
  function fullscren() { this.parentNode.mozRequestFullScreen(); }
  document.getElementById('local-video').addEventListener('click', fullscren);
  document.getElementById('remote-video').addEventListener('click', fullscren);

  //Etherpad
  function add_etherpad() {
    var qs = '?showControls=false&showChat=false&showLineNumbers=true' +
      '&useMonospaceFont=false';
    var etherpad_url = etherpadStatusParsed.base_url + '/p/' + room + qs;
    document.getElementById('etherpad').innerHTML =
      '<iframe id="etherpad-iframe" src="' + etherpad_url + '">';
  }

  function check_etherpad() {
    var etherpadStatus = new XMLHttpRequest();
    etherpadStatus.open("GET", '/etherpad/' + room, true);
    etherpadStatus.onreadystatechange = function() {
      if (etherpadStatus.readyState === 4) {
        if (etherpadStatus.status === 200) {
          console.log(etherpadStatus.responseText);
          etherpadStatusParsed = JSON.parse(etherpadStatus.responseText);
          if (etherpadStatusParsed.code === 0) {
            add_etherpad();
          }
        }
      }
    };
    etherpadStatus.send(null);
  }

  document.getElementById('create_etherpad')
    .addEventListener('click', add_etherpad);

  check_etherpad();

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
    scratcharea.monitor().stop();
    console.error("DataChanneld Error: " + e);
  };
  dataChannel.onclose = function() {
    scratcharea.node.setAttribute("disabled", "disabled");
    scratcharea.monitor().stop();
  };

});

