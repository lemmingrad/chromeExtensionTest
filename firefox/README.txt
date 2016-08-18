To install in Firefox:

Open Firefox browser.
Open the config page using URL "about:config"
Continue past the warning about messing with things you don't understand.
Near the bottom of the list, change the value of "xpinstall.signatures.required" to false.
Open the extensions page via Add-ons in settings menu. Or use the URL "about:addons".
Drag the ccautologout.xpi file onto the page.
Confirm you want to add the extension.
Ensure CCollab Auto-logout extension is installed and enabled.

Note: Because the extension is unsigned, you have to allow Firefox to run untrusted addons by
setting xpinstall.signatures.required to false, and you will get warnings about it not being
verified for use in Firefox in the Extensions page.

To use:

Extension adds a little "CC" icon into your toolbar. Click it to access setup.
Local:
  Enable "Force logout if all CCollab tabs are closed" checkbox.
  Use the "Log me out now" button as a shortcut to log out as necessary.
Experimental Remote:
  Ignore it for now, I'm still working on the server!
