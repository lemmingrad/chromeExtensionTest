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

//function removeCookie(domain, cookieName) {
//	chrome.cookies.remove({"url": "http://" + domain + "/", "name": cookieName}, function(deleted_cookie) { 
//		console.log("Deleted cookie: " + deleted_cookie); 
//	});
//}

function onCookieExists(domain, cookieName, callbackFn) {
	chrome.cookies.get({"url": "http://" + domain + "/", "name": cookieName}, function(cookie) {
		if (cookie) {
			callbackFn(domain, cookie);
		}
	});
}
//function onCookieNotExists(domain, cookieName, callbackFn) {
//	chrome.cookies.get({"url": "http://" + domain + "/", "name": cookieName}, function(cookie) {
//		if (null == cookie) {
//			callbackFn(domain);
//		}
//	});
//}
function onCookie(domain, cookieName, callbackFn) {
	chrome.cookies.get({"url": "http://" + domain + "/", "name": cookieName}, function(cookie) {
		callbackFn(domain, cookie);
	});
}

function getLocalStorageBool(id, dfault) {
	if (null != localStorage[id]) {
		return !!JSON.parse(localStorage[id].toLowerCase());
	}
	return dfault;
}
function getLocalStorageInt(id, dfault) {
	if (null != localStorage[id]) {
		return parseInt(localStorage[id]);
	}	
	return dfault;
}
function getLocalStorageString(id, dfault) {
	if (null != localStorage[id]) {
		return localStorage[id];
	}
	return dfault;
}

function testTabs(domain, callbackFn) {
	chrome.tabs.query({"url": "*://" + domain + "/*"}, function(tabs) {
		var fg_count = 0;
		for (var i = 0; i < tabs.length; i++) {
			if (tabs[i].active) {
				++fg_count;
			}
		}

		callbackFn(domain, tabs.length, fg_count);
 	});
}

function doSendRemoteUpdate(domain, cookie) {
	if (cookie) {
		onCookieExists(domain, "CodeCollaboratorLogin", doNotifyAjax);
	} else {
		onCookieExists(domain, "CodeCollaboratorLogin", doClearAjax);
	}
}
function doNotifyAjax(domain, cookie) {
	//-- Heartbeat to server
	var URL = "http://" + getLocalStorageString("remote_address", "localhost:8080") + "/s/update.py?ccid=" + cookie.value;
	var remoteInterval = getLocalStorageInt("remote_interval", 0);
	if (remoteInterval > 0) {
		URL += "&hold=" + remoteInterval;
	}

	request = new XMLHttpRequest();
  	if (request) {
      	request.open("GET", URL);
       	request.send();
   	}
	console.log("Notify Ajax: " + URL);
	dirtyFlag = false;
}
function doClearAjax(domain, cookie) {
	//-- Tell server to remove us
	var URL = "http://" + getLocalStorageString("remote_address", "localhost:8080") + "/s/update.py?ccid=" + cookie.value + "&action=remove";
	request = new XMLHttpRequest();
  	if (request) {
      	request.open("GET", URL);
       	request.send();
   	}
	console.log("Notify Ajax: " + URL);
	dirtyFlag = false;
}

function doLogoutNameTest(domain, cookie) {
	onCookieExists(domain, "CodeCollaboratorLogin", doLogoutScreen);
}
function doLogoutScreen(domain, cookie) {
	//-- Show logout screen
    var newURL = "http://" + domain + "/ui#logout:";
	chrome.tabs.create({ url: newURL, active: false }, function(tab) {
		setTimeout(function(id) { chrome.tabs.remove(id); }, 5 * 1000, tab.id);
	});
	
	if (true == getLocalStorageBool("remote_toggle", false)) {
		setTimeout(doClearAjax, 5 * 1000, domain, cookie);
	}
}

function doSetTicketExistsBool(domain, cookie) {
	var ticketExists = (null != cookie);
	if (ticketExists != prevTicketExisted) {
		prevTicketExisted = ticketExists;
		dirtyFlag = true;
	}
}

var dirtyFlag = true;
var prevTabCount = 0;
var prevTicketExisted = false;

var futureTimeEvent = {
	id: null,
	limit: 0,
	callback: null,
	set: function(_callback, _limit) {
		this.callback = _callback;
		this.limit = _limit;
		console.log("futureTimeEvent set(" + _limit + ")");
	},
	start: function() {
		if (true == getLocalStorageBool("auto_toggle_fg", false)) {
			if (null == this.id && 0 < this.limit && null != this.callback) {
				this.id = setTimeout(this.callback, this.limit);
			}
		}
		console.log("futureTimeEvent started");
	},
	stop: function() {
		if (null != this.id) {
			clearTimeout(this.id);
			this.id = null;
		}
		console.log("futureTimeEvent stopped");
	},
	restart: function() {
		this.stop();
		this.start();
	}
}

function doWork(domain, tab_count, fg_count) {
	//-- just some debug info. Spam!
	console.log(tab_count + " open " + domain + " tabs detected (" + fg_count + " active).");
	getCookies(domain);
	
	//-- local logout logic block:
	
	//-- set futureEvent
	futureTimeEvent.set(function() { 
		onCookieExists(domain, "CodeCollaboratorTicketId", doLogoutNameTest);
		futureTimeEvent.stop();
	}, getLocalStorageInt("auto_interval_fg", 300) * 1000); 

	// if number of tabs is 0
	//   if auto_toggle is true
	//     if ticket exists
	//       if user exists
	//         load logout tab
	//         if remote_toggle is true
	//           send "left" to server
	//           clear dirty flag
	//         endif
	//       endif
	//     endif
	//   endif
	// endif
	if (0 < tab_count) {
		if (0 < fg_count) {
			//-- at least 1 domain tabs in foreground
			futureTimeEvent.restart();
		} else {
			//-- no domain tabs in foreground
		}
	} else {
		futureTimeEvent.stop();
		if (true == getLocalStorageBool("auto_toggle", false)) {
			onCookieExists(domain, "CodeCollaboratorTicketId", doLogoutNameTest);
		}
	}

	//-- remote logic block:

	//-- update dirty flag if ticket exists has changed
	onCookie(domain, "CodeCollaboratorTicketId", doSetTicketExistsBool);

	//-- update dirty flag if number of tabs has changed
	if (tab_count != prevTabCount) {
		prevTabCount = tab_count;
		dirtyFlag = true;
	}

	// if remote_toggle is true
	//   if dirty flag is true
	//     if ticket exists
	//       if user exists
	//         send "alive"
	//       endif
	//     else
	//       if user exists
	//         send "left"
	//       endif
	//     endif
	//     clear dirty flag
	//   endif
	// endif
	if (true == getLocalStorageBool("remote_toggle", false) && true == dirtyFlag) {
		onCookie(domain, "CodeCollaboratorTicketId", doSendRemoteUpdate);
	}
}

//-- set refresh interval for main logic loop
setInterval(function() {
	testTabs("atx-coder.rsi.global", doWork);
}, 15 * 1000);
