var express = require('express');
var app = express();

app.use('/static', express.static(__dirname + '/public'));

app.listen(6424);
console.log('Listening on port 6424');

