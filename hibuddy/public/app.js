$(document).ready(function() {

    var video1 = $('#video1')[0];

    $('#start-video').click(function() {
        window.navigator.mozGetUserMedia({video: true}, function(stream) {
            video1.src = stream;
            video1.play();
        }, function(err) {
            video1.pause();
            video1.src = '';
        });
    });

    $('#stop-video').click(function() {
        video1.pause();
        video1.src = '';
    });

});

