var inherits = require("util").inherits;
var SmokeServer = require("smoke-signals").SmokeServer;
var express = require("express");

function HibuddyServer(config) {
  SmokeServer.call(this, config);

  var OPTIONS = {root: __dirname + "/../"};
  this.app.use('/static', express.static(__dirname + '/../client'));
  this.app.get("/", function(req, res) {
    res.sendfile('/client/index.html', OPTIONS);
  });

  this.app.get('/rooms/:room', function(req, res) {
    var roomId = req.param('room');

    if (this.rooms.get(roomId))
      res.sendfile('/client/room.html', OPTIONS);
    else
      res.status(404).sendfile('/client/404.html', OPTIONS);
  }.bind(this));
}

inherits(HibuddyServer, SmokeServer);

module.exports = HibuddyServer;
