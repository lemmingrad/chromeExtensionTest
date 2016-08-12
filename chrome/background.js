function getCookies(domain) {
	chrome.cookies.getAll({"domain": domain}, function(cookies) {
		if (cookies.length > 0) {
			for (var i = 0; i < cookies.length; i++) {
				console.log("Cookie: " + cookies[i].domain + cookies[i].path + ", name: " + cookies[i].name + ", val: " + cookies[i].value);
			}
		} else {
			console.log("0 cookies found.");
		}
	});
}

function removeCookie(domain, cookieName) {
	chrome.cookies.remove({"url": "http://" + domain + "/", "name": cookieName}, function(deleted_cookie) { 
		console.log("Deleted cookie: " + deleted_cookie); 
	});
}

function testCookie(domain, cookieName, callbackFn) {
	chrome.cookies.get({"url": "http://" + domain + "/", "name": cookieName}, function(cookie) {
		if (cookie) {
			callbackFn(domain, cookie);
		}
	});
}
function testNoCookie(domain, cookieName, callbackFn) {
	chrome.cookies.get({"url": "http://" + domain + "/", "name": cookieName}, function(cookie) {
		if (null == cookie) {
			callbackFn(domain);
		}
	});
}
function testTabs(domain, callbackFn) {
	chrome.tabs.query({"url": "*://" + domain + "/*"}, function(tabs2) {  
		callbackFn(domain, tabs2.length);
 	});
}

function doNotifyNameTest(domain, cookie) {
	testCookie(domain, "CodeCollaboratorLogin", doNotifyAjax);
}
function doNotifyAjax(domain, cookie) {
	// Heartbeat to server
	URL = "http://localhost:8008/s/update.py?ccid=" + cookie.value;
	request = new XMLHttpRequest();
  	if (request) {
      	request.open("GET", URL);
       	request.send();
   	}
	console.log("Notify Ajax: " + URL);
}

var gLogoutTimerId = null;

function doClearNameTest(domain, cookie) {
	clearTimeout(gLogoutTimerId);
	gLogoutTimerId = null;
	testCookie(domain, "CodeCollaboratorLogin", doClearAjax);
}
function doClearAjax(domain, cookie) {
	// Tell server to remove us
	URL = "http://localhost:8008/s/update.py?ccid=" + cookie.value + "&action=left";
	request = new XMLHttpRequest();
  	if (request) {
      	request.open("GET", URL);
       	request.send();
   	}
	console.log("Notify Ajax: " + URL);
}

function doLogoutNameTest(domain, cookie) {
	testCookie(domain, "CodeCollaboratorLogin", doLogoutStartTimer);
}
function doLogoutStartTimer(domain, cookie) {
	if (JSON.parse(localStorage.auto_toggle) == true) {
		var t = localStorage.auto_interval;
		clearTimeout(gLogoutTimerId);
		gLogoutTimerId = setTimeout(doLogoutScreen, t * 1000, domain);
		
		console.log("starting logout screen timer " + t);
	}
}
function doLogoutScreen(domain) {
	// Show logout screen
    var newURL = "http://" + domain + "/ui#logout:";
    chrome.tabs.create({ url: newURL });
}

function doWork(domain, c) {
	console.log(c + " open " + domain + " tabs detected.");
	getCookies(domain);
	if (0 < c) {
		testCookie(domain, "CodeCollaboratorTicketId", doNotifyNameTest);
	} else {
		testCookie(domain, "CodeCollaboratorTicketId", doLogoutNameTest);
	}

	testNoCookie(domain, "CodeCollaboratorTicketId", doClearNameTest);
}

setInterval(function() {
	testTabs("atx-coder.rsi.global", doWork);
}, 60 * 1000);
