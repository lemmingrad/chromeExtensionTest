

setInterval(function() {
	var ifr = document.getElementById('users');
	ifr.src = "http://localhost:8008/s/list.py";
//	ifr.location.reload();
}, 1 * 60 * 1000);



