/* globals EventSource, MicroEvent,
   mozRTCPeerConnection, mozRTCSessionDescription, mozRTCIceCandidate */

function HiBuddyApp(room) {
  this.room = room;
  this.me = undefined;
}

HiBuddyApp.prototype = {
  start: function(stream, callback) {
    this.stream = stream;
    this.onRemoteStream = callback;

    this.source = new EventSource("/rooms/" + this.room + "/signalling");
    this.source.on = this.source.addEventListener.bind(this.source);
    this.source.on("uid",          this._onUID.bind(this));
    this.source.on("newbuddy",     this._onNewBuddy.bind(this));
    this.source.on("offer",        this._onOffer.bind(this));
    this.source.on("answer",       this._onAnswer.bind(this));
    this.source.on("icecandidate", this._onIceCandidate.bind(this));
  },

  _onUID: function(event) {
    var message = JSON.parse(event.data);
    this.me = message.uid;
    console.log('UID: ' + this.me);
  },

  _onNewBuddy: function() {
    var peerConnection = new mozRTCPeerConnection(this.config);
    this.peerConnection = this._setupPeerConnection(peerConnection);
    this._sendOffer();
    this.trigger("newbuddy");
  },

  _onOffer: function(event) {
    var message = JSON.parse(event.data);
    var peerConnection = new mozRTCPeerConnection(this.config);

    this.peerConnection = this._setupPeerConnection(peerConnection);

    var offer = new mozRTCSessionDescription(message.offer);
    this.peerConnection.setRemoteDescription(offer, function() {
      this._sendAnswer();
    }.bind(this));
  },

  _onAnswer: function(event) {
    var message = JSON.parse(event.data);
    console.log(message.answer);

    var answer = new mozRTCSessionDescription(message.answer);
    this.peerConnection.setRemoteDescription(answer, function() {
      console.log("done");
    }.bind(this));
  },

  _onIceCandidate: function(event) {
    var message = JSON.parse(event.data);

    var candidate = new mozRTCIceCandidate(message.candidate);
    this.peerConnection.addIceCandidate(candidate);
  },

  _onIceStateChange: function() {
    // XXX: display an error if the ice connection failed
    console.log("ice: " + this.peerConnection.iceConnectionState);
    if (this.peerConnection.iceConnectionState === "failed") {
      console.error("Something went wrong: the connection failed");
      this.trigger("failure");
    }

    if (this.peerConnection.iceConnectionState === "connected")
      this.trigger("connected");
  },

  _onNewIceCandidate: function(event) {
    if (event.candidate) {
      var candidate = {
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex
      };
      this._post({type: 'iceCandidate', from: this.me, candidate: candidate});
    }
  },

  _onAddStream: function(event) {
    this.onRemoteStream(event.stream);
  },

  _setupPeerConnection: function(pc) {
    pc.onaddstream = this._onAddStream.bind(this);
    pc.oniceconnectionstatechange = this._onIceStateChange.bind(this);
    pc.onicecandidate = this._onNewIceCandidate.bind(this);
    pc.addStream(this.stream);
    return pc;
  },

  _sendOffer: function() {
    // Create offer
    this.peerConnection.createOffer(function(offer) {
      this.peerConnection.setLocalDescription(offer, function() {
        // Send offer
        this._post({type: 'offer', from: this.me, offer: offer});
      }.bind(this));
    }.bind(this), function() {});
  },

  _sendAnswer: function() {
    // Create answer
    this.peerConnection.createAnswer(function(answer) {
      this.peerConnection.setLocalDescription(answer, function() {
        // Send answer
        this._post({type: 'answer', from: this.me, answer: answer});
      }.bind(this));
    }.bind(this), function() {});
  },

  _post: function(data) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/rooms/' + this.room + '/signalling', true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(data));
  }

};

MicroEvent.mixin(HiBuddyApp);
HiBuddyApp.prototype.on = HiBuddyApp.prototype.bind;

