function removeCookie(domain, cookieName) {
	chrome.cookies.remove({"url": "http://" + domain + "/", "name": cookieName}, function(deleted_cookie) { 
		console.log(deleted_cookie); 
	});
}

function requestRelease() {
	var ifr = document.getElementById('users');
//	ifr.src = "http://localhost:8008/s/request.py";	

	//-- Doesn't work, not enough permissions
	ifr.src = "http://atx-coder.rsi.global/ui#logout:";	
	
	//-- Doesn't work, doesn't actually clear server tokens
	var request = new XMLHttpRequest();
	if (request) {
		request.open("GET", "http://atx-coder.rsi.global/ui#logout:", false);
       	request.send();
		
		console.log(request.status);
		console.log(request.responseText);
	}
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

