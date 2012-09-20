$(document).ready(function() {

    var video1 = $('#video1')[0];
    var interv;

    $('#start-video').click(function() {
        window.navigator.mozGetUserMedia({video: true}, function(stream) {
            video1.src = stream;
            video1.play();
            interv = setInterval(capture, 200);
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

    window.capture = function(){
        var width  = video1.clientWidth;
        var height = video1.clientHeight;

        var buffer = document.createElement('canvas');
        var bufferContext = buffer.getContext('2d');
        var canvas = $('#feedback')[0];
        var context = canvas.getContext('2d');

        buffer.width = canvas.width = width;
        buffer.height = canvas.height = height;
        bufferContext.drawImage(video1, 0, 0, width, height);
        var data = bufferContext.getImageData(0, 0, width, height);
        context.putImageData(data, 0, 0);
    };

});

