function requestRelease() {
	var ifr = document.getElementById('users');
	ifr.src = "http://localhost:8008/s/request.py";	

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
	
	logMeOut();
}

function logMeOut() {
    var newURL = "http://atx-coder.rsi.global/ui#logout:";
    chrome.tabs.create({ url: newURL });
}

function toggleAutoLogout() {
	var auto_toggle = document.getElementById("auto_toggle");
	localStorage.auto_toggle = auto_toggle.checked;
	document.getElementById("auto_interval").disabled = !auto_toggle.checked;
}

function updateAutoLogoutInterval() {
	var auto_interval = document.getElementById("auto_interval");
	localStorage.auto_interval = auto_interval.value;
}

window.onunload = function() {
	var auto_toggle = document.getElementById("auto_toggle");
	localStorage.auto_toggle = auto_toggle.checked;
	
	var auto_interval = document.getElementById("auto_interval");
	localStorage.auto_interval = auto_interval.value;
}

window.onload = function() {
	document.getElementById("controls").addEventListener("submit", function(e) { e.preventDefault(); return false; });
	document.getElementById("request").addEventListener("click", requestRelease);
	document.getElementById("logout").addEventListener("click", logMeOut);
	
	var auto_toggle = document.getElementById("auto_toggle");
	auto_toggle.checked = JSON.parse(localStorage.auto_toggle);
	auto_toggle.addEventListener("click", toggleAutoLogout);
	
	var auto_interval = document.getElementById("auto_interval");
	auto_interval.value = localStorage.auto_interval;
	auto_interval.disabled = !auto_toggle.checked;
	auto_interval.addEventListener("change", updateAutoLogoutInterval);
}

setInterval(function() {
	var ifr = document.getElementById('users');
	ifr.src = "http://localhost:8008/s/list.py";
}, 60 * 1000);

