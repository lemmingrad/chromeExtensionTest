function removeCookie(domain, cookieName) {
	chrome.cookies.remove({"url": "http://" + domain + "/", "name": cookieName}, function(deleted_cookie) { 
		console.log(deleted_cookie); 
	});
}

function getCookies(domain) {
	chrome.cookies.getAll({"domain": domain}, function(cookies) {
		if (cookies.length > 0) {
			for (var i = 0; i < cookies.length; i++) {
				console.log("cookie: " + cookies[i].domain + cookies[i].path + ", name: " + cookies[i].name + ", val: " + cookies[i].value);
			}
		} else {
			console.log("0 cookies found.");
		}
	});
}

function testCookie(domain, cookieName, callbackFn) {
	chrome.cookies.get({"url": "http://" + domain + "/", "name": cookieName}, function(cookie) {
		if (cookie) {
			callbackFn(domain, cookie);
		}
	});
}

function testTabs(domain, callbackFn) {
	chrome.tabs.query({"url": "*://" + domain + "/*"}, function(tabs2) {  
		callbackFn(domain, tabs2.length);
 	});
}

function doNotify(domain, cookie) {

	URL = "http://localhost:8008/s/update.py?ccid=" + cookie.value;
	request = new XMLHttpRequest();
  	if (request) {
      	request.open("GET", URL);
       	request.send();
   	}
}

function doWork(domain, c) {
	console.log(c + " open " + domain + " tabs detected.");
	if (0 < c) {
		getCookies(domain);
		testCookie(domain, "CodeCollaboratorLogin", doNotify);
	}
}

setInterval(function() {
	testTabs("atx-coder.rsi.global", doWork);
}, 1 * 60 * 1000);
