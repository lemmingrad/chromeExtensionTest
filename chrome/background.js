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

function doNotifyTicketTest(domain, cookie) {
	testCookie(domain, "CodeCollaboratorTicketId", doNotifyAjax);
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

function doClearLogoutScreen(domain) {
	// Show logout screen
    var newURL = "http://" + domain + "/ui#logout:";
    chrome.tabs.create({ url: newURL });
	
	// Logout should remove this cookie for us, hopefully don't need to do it here.
	//removeCookie(domain, "CodeCollaboratorTicketId");
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

function doWork(domain, c) {
	console.log(c + " open " + domain + " tabs detected.");
	getCookies(domain);
	if (0 < c) {
		testCookie(domain, "CodeCollaboratorLogin", doNotifyTicketTest);
	} else {
		testCookie(domain, "CodeCollaboratorTicketId", doClearLogoutScreen);
		testNoCookie(domain, "CodeCollaboratorTicketId", doClearNameTest);
	}
}

setInterval(function() {
	testTabs("atx-coder.rsi.global", doWork);
}, 1 * 60 * 1000);
