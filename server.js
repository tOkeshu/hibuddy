var express = require('express');
var app = express();
var connections = [];
var counter = 0;

app.use(express.bodyParser());
app.use('/static', express.static(__dirname + '/public'));

app.get("/", function(req, res) {
    res.sendfile(__dirname + '/public/index.html');
});

app.get("/signalling", function(req, res) {
    console.log('new friend');

    res.writeHead(200, {
        "Content-Type":  "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection":    "keep-alive"
    });

    req.on("close", function() {
        var i = connections.indexOf(res);
        connections.splice(i, 1);
    });

    var event = JSON.stringify({type: 'uid', uid: counter++});
    res.write("event: uid\n");
    res.write("data: " + event + "\n\n");

    connections.map(function(c) {
        c.write("event: newfriend\n");
        c.write("data: {}\n\n");
    });
    connections.push(res);
});

app.post("/signalling", function(req, res) {
    var type = req.body.type;
    var event = JSON.stringify(req.body);
    console.log(req.body);

    connections.map(function(c) {
        c.write("event: " + type + "\n");
        c.write("data: " + event + "\n\n");
    });

    res.send(200);
});

app.listen(6424);
console.log('Listening on port 6424');

