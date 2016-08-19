function requestRelease() {
	//-- Fire off an AJAX request to remote server, requesting it release the first user in the list.
	var req = new XMLHttpRequest();
	if (req) {
       	req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) {
				var div = document.getElementById('remote_users');
				div.innerHTML = req.responseText;
            }
        }
		var URL = "http://" + localStorage.remote_address + "/s/request.py";
		req.open("GET", URL);
		req.send();
	}	
}

function logMeOut() {
	//-- AJAX requesting the logout page in the background doesn't work; server token not removed.
/*	var request = new XMLHttpRequest();
	if (request) {
		request.open("GET", "http://atx-coder.rsi.global/ui#logout:", false);
       	request.send();
		
		console.log(request.status);
		console.log(request.responseText);
	}
*/	
    //-- But bringing up a new browser tab with the logout page does work.
	var newURL = "http://atx-coder.rsi.global/ui#logout:";
	chrome.tabs.create({ url: newURL, active: false }, function(tab) {
		var id = tab.id;
		setTimeout(function(id) { chrome.tabs.remove(id); }, 5 * 1000, id);
	});
}

function toggleAutoLogout() {
	var auto_toggle = document.getElementById("auto_toggle");
	localStorage.auto_toggle = auto_toggle.checked;
}

function toggleRemoteLogout() {
	var remote_toggle = document.getElementById("remote_toggle");
	localStorage.remote_toggle = remote_toggle.checked;
	document.getElementById("remote_interval").disabled = !remote_toggle.checked;
	document.getElementById("remote_address").disabled = !remote_toggle.checked;
}

function updateRemoteLogoutInterval() {
	var remote_interval = document.getElementById("remote_interval");
	localStorage.remote_interval = remote_interval.value;
}

function updateRemoteLogoutAddress() {
	var remote_address = document.getElementById("remote_address");
	localStorage.remote_address = remote_address.value;
}

function updateUsers() {
	//-- Fire off an AJAX request to get list of users from remote server. Display results at the bottom of the popup
	var req = new XMLHttpRequest();
	if (req) {
       	req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) {
				var div = document.getElementById('remote_users');
				div.innerHTML = req.responseText;
            }
        }
		var URL = "http://" + localStorage.remote_address + "/s/list.py";
		req.open("GET", URL);
		req.send();
	}	
}

window.onunload = function() {
	var auto_toggle = document.getElementById("auto_toggle");
	localStorage.auto_toggle = auto_toggle.checked;

	var remote_toggle = document.getElementById("remote_toggle");
	localStorage.remote_toggle = remote_toggle.checked;
	
	var remote_interval = document.getElementById("remote_interval");
	localStorage.remote_interval = remote_interval.value;

	var remote_address = document.getElementById("remote_address");
	localStorage.remote_address = remote_address.value;
}

window.onload = function() {
	//-- Disable forms triggering default action (submit) if return key is pressed in input fields
	document.getElementById("local_controls").addEventListener("submit", function(e) { e.preventDefault(); return false; });
	document.getElementById("remote_controls").addEventListener("submit", function(e) { e.preventDefault(); return false; });
	
	//-- Add click/change listeners to input widgets
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
	
	var remote_address = document.getElementById("remote_address");
	remote_address.value = localStorage.remote_address;
	remote_address.disabled = !remote_toggle.checked;
	remote_address.addEventListener("change", updateRemoteLogoutAddress);

	//-- get remote user list once on load
	updateUsers();
}

//-- set remote user list to refresh at set interval
setInterval(updateUsers, 60 * 1000);

