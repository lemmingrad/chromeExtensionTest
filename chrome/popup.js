
function requestRelease() {
	var ifr = document.getElementById('users');
	ifr.src = "http://localhost:8008/s/request.py";	
}

window.onload = function(){
	document.getElementById("request").addEventListener("click", requestRelease);
}

setInterval(function() {
	var ifr = document.getElementById('users');
	ifr.src = "http://localhost:8008/s/list.py";
}, 1 * 60 * 1000);

