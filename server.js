var express = require('express');
var app = express();
var connections = [];

app.use('/static', express.static(__dirname + '/public'));

app.get("/signalling", function(req, res) {
    console.log("/signalling connection opened");

    res.writeHead(200, {
        "Content-Type":  "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection":    "keep-alive"
    });

    req.on("close", function() {
        var i = connections.indexOf(res);
        connections.splice(i, 1);
    });
});


app.listen(6424);
console.log('Listening on port 6424');

