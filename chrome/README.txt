To install in Chrome:

1) Unzip the latest .zip to local folder of your choice.
2) Open Chrome browser.
3) Open the extensions page via settings. Or use the URL "chrome:://extensions".
4) Enable the "Developer mode" checkbox in the top-right corner of the page.
5) Click "Load unpacked extension".
6) Select the folder containing the loose files (with the "manifest.json" file in).
7) Confirm you want to add the extension.
8) Ensure correct version of CCollab Auto-logout extension is installed and enabled.

Note: Unfortunately, because the extension is unsigned, you might get warnings about it 
not being from a trusted source, ie: Chrome Web Store, when you start up the browser.
Nothing I can do about this for now. At least the developer mode doesn't outright 
disable the extension like the packaged version did.

If the CC icon in the toolbar appears orange, and you get a 
"Disable developer mode extensions" popup:
Click Cancel to close the popup.


To use:

Extension adds a little "CC" icon into your toolbar. Click it to access setup.
Local:
  Enable "Force logout if all CCollab tabs are closed" checkbox.
  Use the "Log me out now" button as a shortcut to log out as necessary.
Experimental Remote:
  Ignore it for now, I'm still working on the server!


History:

25/8/16: Version 1.0.4
Added: Auto-logout from ccollab if no ccollab tab is active (the foreground tab) for a number of seconds.
Added: Logout tab now opens in the background, and closes after 5 seconds.

18/8/16: Version 1.0
Added: Auto-logout from ccollab if all ccollab tabs are closed (but browser stays open).



