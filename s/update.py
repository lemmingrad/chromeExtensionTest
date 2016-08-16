#!/c/Python27/python
# -*#!C:\Python27\python.exe -u
# -*#!/usr/bin/env python

import cgi
import sqlite3

# default number of seconds for the hold field if not supplied in querystring
default_timeout = 300

sqlite_file = 'ccid.sqlite'    # name of the sqlite database file
sqlite_table = 'ccid_table'

conn = sqlite3.connect(sqlite_file)
c = conn.cursor()

print "Content-type: text/html"
print "Access-Control-Allow-Origin: *"
print
print "<title>Update CCID</title>"

form = cgi.FieldStorage()
ccid = form.getvalue('ccid')
action = form.getvalue('action')
timeout = form.getvalue('hold', repr(default_timeout));

if ccid is not None:
	if action is not None and "remove" == action:
		query = 'DELETE FROM ' + sqlite_table + ' WHERE ccid=?'
		print query + '<hr>'
		c.execute(query, (ccid,))
	elif action is not None and "hold" == action:
		query = 'UPDATE OR IGNORE ' + sqlite_table + ' SET time=datetime("now"),hold=-1 WHERE ccid=?'
		print query + '<br>'
		c.execute(query, (ccid,))
		query = 'INSERT OR IGNORE INTO ' + sqlite_table + ' (ccid, time, hold) VALUES (?, datetime("now"), -1)'
		print query + '<hr>'
		c.execute(query, (ccid,))
	else:
		# if action != 'remove', or action != "hold", or action ommitted, do the default update
		query = 'UPDATE OR IGNORE ' + sqlite_table + ' SET time=datetime("now"),hold=? WHERE ccid=?'
		print query + '<br>'
		c.execute(query, (timeout,ccid))
		query = 'INSERT OR IGNORE INTO ' + sqlite_table + ' (ccid, time, hold) VALUES (?, datetime("now"), ?)'
		print query + '<hr>'
		c.execute(query, (ccid,timeout))
	
	# Committing changes
	conn.commit()

	print "<p>Refreshed timestamp for user '%s'</p>" % ccid
else:
	print "<p>No user specified</p>"
	
# Closing the connection to the database file
conn.close()
