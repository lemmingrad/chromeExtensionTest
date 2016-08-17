function requestRelease() {
	var ifr = document.getElementById('remote_users');
	ifr.src = "http://localhost:8008/s/request.py";	

	//-- Doesn't work, not enough permissions
/*
	ifr.src = "http://atx-coder.rsi.global/ui#logout:";	
*/
/*	
	//-- Doesn't work, doesn't actually clear server tokens
	var request = new XMLHttpRequest();
	if (request) {
		request.open("GET", "http://atx-coder.rsi.global/ui#logout:", false);
       	request.send();
		
		console.log(request.status);
		console.log(request.responseText);
	}
*/	
}

function logMeOut() {
    var newURL = "http://atx-coder.rsi.global/ui#logout:";
    chrome.tabs.create({ url: newURL });
}

function toggleAutoLogout() {
	var auto_toggle = document.getElementById("auto_toggle");
	localStorage.auto_toggle = auto_toggle.checked;
}

function toggleRemoteLogout() {
	var remote_toggle = document.getElementById("remote_toggle");
	localStorage.remote_toggle = remote_toggle.checked;
	document.getElementById("remote_interval").disabled = !remote_toggle.checked;
}

function updateRemoteLogoutInterval() {
	var remote_interval = document.getElementById("remote_interval");
	localStorage.remote_interval = remote_interval.value;
}

function updateUsers() {
	var req = new XMLHttpRequest();
	if (req) {
       	req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) {
				var div = document.getElementById('remote_users');
				div.innerHTML = req.responseText;
            }
        }
		req.open("GET", "http://localhost:8008/s/list.py");
		req.send();
	}	
}

window.onunload = function() {
	var auto_toggle = document.getElementById("auto_toggle");
	localStorage.auto_toggle = auto_toggle.checked;

	var remote_toggle = document.getElementById("remote_toggle");
	localStorage.remote_toggle = remote_toggle.checked;
	
	var auto_interval = document.getElementById("remote_interval");
	localStorage.remote_interval = remote_interval.value;
}

window.onload = function() {
	document.getElementById("local_controls").addEventListener("submit", function(e) { e.preventDefault(); return false; });
	document.getElementById("remote_controls").addEventListener("submit", function(e) { e.preventDefault(); return false; });
	document.getElementById("request").addEventListener("click", requestRelease);
	document.getElementById("logout").addEventListener("click", logMeOut);
	
	var auto_toggle = document.getElementById("auto_toggle");
	auto_toggle.checked = JSON.parse(localStorage.auto_toggle);
	auto_toggle.addEventListener("click", toggleAutoLogout);
	
	var remote_toggle = document.getElementById("remote_toggle");
	remote_toggle.checked = JSON.parse(localStorage.remote_toggle);
	remote_toggle.addEventListener("click", toggleRemoteLogout);

	var remote_interval = document.getElementById("remote_interval");
	remote_interval.value = localStorage.remote_interval;
	remote_interval.disabled = !remote_toggle.checked;
	remote_interval.addEventListener("change", updateRemoteLogoutInterval);
	
	updateUsers();
}

setInterval(updateUsers, 15 * 1000);

