(function() {
  var room = window.location.pathname.split('/')[2];
  document.querySelector('input[type="hidden"]').value = room;
}());

