(function() {
  document.querySelector("input").addEventListener("click", function() {
    var xhr = new XMLHttpRequest();
    var room = window.location.pathname.split('/')[2];

    xhr.onload = function(event) {
      var message = JSON.parse(this.responseText);
      window.location = "/rooms/" + message.room;
    };

    xhr.open('POST', '/api/rooms/', true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(room ? JSON.stringify({room: room}) : undefined);
  });
}());
