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
function onCookieExists(domain, cookieName, callbackFn) {
	chrome.cookies.get({"url": "http://" + domain + "/", "name": cookieName}, function(cookie) {
		if (cookie) {
			callbackFn(domain, cookie);
		}
	});
}
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
//	console.log("Notify Ajax: " + URL);
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
//	console.log("Notify Ajax: " + URL);
	dirtyFlag = false;
}

function doLogoutNameTest(domain, cookie) {
	onCookieExists(domain, "CodeCollaboratorLogin", doLogoutScreen);
}
function doLogoutScreen(domain, cookie) {
	//-- Show logout screen in background, close it after 5 seconds
    //-- After close, send clear event off to remote sever if necessary.
	var newURL = "http://" + domain + "/ui#logout:";
	chrome.tabs.create({ url: newURL, active: false }, function(tab) {
		setTimeout(function(_id, _domain, _cookie) { 
			chrome.tabs.remove(_id); 
			if (true == getLocalStorageBool("remote_toggle", false)) {
				doClearAjax(_domain, _cookie);
			}
		}, 5 * 1000, tab.id, domain, cookie);
	});
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
	callback: function(domain) { 
		if (true == getLocalStorageBool("auto_toggle_fg", false)) {
			onCookieExists(domain, "CodeCollaboratorTicketId", doLogoutNameTest);
		}
//		console.log("futureTimeEvent callback");
		futureTimeEvent.stop();
	},
	start: function(domain, limit) {
		if (null == this.id) {
			if (true == getLocalStorageBool("auto_toggle_fg", false)) {
				this.limit = limit;
				this.id = setTimeout(this.callback, limit, domain);
//				console.log("futureTimeEvent started");
			}
		}
	},
	stop: function() {
		if (null != this.id) {
			clearTimeout(this.id);
			this.id = null;
		}
//		console.log("futureTimeEvent stopped");
	},
	update: function(domain, limit, fg) {
		if (true == getLocalStorageBool("auto_toggle_fg", false)) {
			if (true == fg) {
//				console.log("futureTimeEvent update (fg)");
				//-- reset timer
				this.stop();
				this.start(domain, limit);
			} else if (limit != this.limit) {
//				console.log("futureTimeEvent update (bg, limit changed)");
				//-- update the timeout limit
				this.stop();
				this.start(domain, limit);
			} else if (null == this.id) {
//				console.log("futureTimeEvent update (bg, not running)");
				this.start(domain, limit);
			}
		} else {
			this.stop();
		}
	}
}

function doWork(domain, tab_count, fg_count) {
	//-- just some debug info. Spam!
//	console.log(tab_count + " open " + domain + " tabs detected (" + fg_count + " active).");
//	getCookies(domain);
	
	//-- local logout logic block:
	
	//-- do tab logic
	if (0 < tab_count) {
		//-- at least 1 domain tab open
		futureTimeEvent.update(domain, getLocalStorageInt("auto_interval_fg", 300) * 1000, (fg_count > 0));
	} else {
		//-- no domain tabs
		//-- stop the timer controlling background tab auto-logout
		futureTimeEvent.stop();
		//-- do no-tabs auto-logout
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

	//-- if dirty flag set, send an update to remote server
	if (true == getLocalStorageBool("remote_toggle", false) && true == dirtyFlag) {
		onCookie(domain, "CodeCollaboratorTicketId", doSendRemoteUpdate);
	}
}

//-- set refresh interval for main logic loop
setInterval(function() {
	testTabs("atx-coder.rsi.global", doWork);
}, 13 * 1000);
