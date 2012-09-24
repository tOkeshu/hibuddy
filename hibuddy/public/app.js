$(document).ready(function() {

    var video1 = $('#video1')[0];
    var interv;

    $('#start-video').click(function() {
        window.navigator.mozGetUserMedia({video: true}, function(stream) {
            video1.src = stream;
            video1.play();
            open(function() {
                interv = setInterval(capture, 100);
            });
        }, function(err) {
            video1.pause();
            video1.src = '';
            clearInterval(interv);
        });
    });

    $('#stop-video').click(function() {
        video1.pause();
        video1.src = '';
        clearInterval(interv);
    });

    var open = function(callback) {
        var uri = "ws://" + location.host + ':6424/rooms/1234';
        window.ws = new WebSocket(uri);

        window.ws.onopen = function() {
            // websocket is connected
            console.log("websocket connected!");
            callback();
        };

        window.ws.onclose = function() {
            // websocket was closed
            console.log("websocket was closed");
            video1.pause();
            video1.src = '';
            clearInterval(interv);
        };
    };

    var capture = function(){
        var width  = video1.clientWidth;
        var height = video1.clientHeight;

        var buffer = document.createElement('canvas');
        var bufferContext = buffer.getContext('2d');
        var canvas = $('#feedback')[0];
        var context = canvas.getContext('2d');

        buffer.width = canvas.width = width;
        buffer.height = canvas.height = height;
        bufferContext.drawImage(video1, 0, 0, width, height);

        var dataUrl = buffer.toDataURL('image/jpeg');
        window.ws.send(dataUrl);
    };

});

