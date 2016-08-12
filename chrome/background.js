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

function getLocalStorageBool(from, dfault) {
	if (null != localStorage[from]) {
		return !!JSON.parse(localStorage[from].toLowerCase());
	}
	return dfault;
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

	var remoteInterval = localStorage.remote_interval || 0;
	if (remoteInterval > 0) {
		URL += "&to=" + remoteInterval;
	}

	request = new XMLHttpRequest();
  	if (request) {
      	request.open("GET", URL);
       	request.send();
   	}
	console.log("Notify Ajax: " + URL);
}

function doClearNameTest(domain, cookie) {
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

var dirtyFlag = true;

function doLogoutNameTest(domain, cookie) {
	testCookie(domain, "CodeCollaboratorLogin", doLogoutScreen);
}
function doLogoutScreen(domain, cookie) {
	// Show logout screen
    var newURL = "http://" + domain + "/ui#logout:";
    chrome.tabs.create({ url: newURL });
	
	if (true == getLocalStorageBool("remote_toggle", false)) {
		doClearAjax(domain, cookie);
		dirtyFlag = false;
	}
}

function doWork(domain, c) {
	console.log(c + " open " + domain + " tabs detected.");
	getCookies(domain);

	// possible states
	// 1) open tabs, ticket, dirty -> send "alive"
	// 2) open tabs, ticket, notdirty -> send "alive"
	// 3) open tabs, no ticket, dirty -> send "left", set notdirty
	// 4) open tabs, no ticket, notdirty -> do nothing
	
	// 5) no tabs, ticket, dirty -> send "alive", set notdirty
	// 6) no tabs, ticket, notdirty -> send "alive", set notdirty
	// 7) no tabs, no ticket, dirty -> send "left", set notdirty
	// 8) no tabs, no ticket, notdirty -> do nothing
	
	if (0 < c) {
	} else {
		if (true == getLocalStorageBool("auto_toggle", false)) {
			testCookie(domain, "CodeCollaboratorTicketId", doLogoutNameTest);
		}
		if (true == getLocalStorageBool("remote_toggle", false)) {
			testCookie(domain, "CodeCollaboratorTicketId", doNotifyNameTest);
			testNoCookie(domain, "CodeCollaboratorTicketId", doClearNameTest);
		}
	}
}

setInterval(function() {
	testTabs("atx-coder.rsi.global", doWork);
}, 30 * 1000);
