
function requestRelease() {
	var ifr = document.getElementById('users');
	ifr.src = "http://localhost:8008/s/request.py";	
}

function logMeOut() {
    var newURL = "http://atx-coder.rsi.global/ui#logout:";
    chrome.tabs.create({ url: newURL });
}

window.onload = function() {
	document.getElementById("request").addEventListener("click", requestRelease);
	document.getElementById("logout").addEventListener("click", logMeOut);
}

setInterval(function() {
	var ifr = document.getElementById('users');
	ifr.src = "http://localhost:8008/s/list.py";
}, 1 * 60 * 1000);

