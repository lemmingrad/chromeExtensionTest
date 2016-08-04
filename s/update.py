#!/c/Python27/python
# -*#!C:\Python27\python.exe -u
# -*#!/usr/bin/env python

import cgi
import sqlite3

sqlite_file = 'ccid.sqlite'    # name of the sqlite database file
sqlite_table = 'ccid_table'

conn = sqlite3.connect(sqlite_file)
c = conn.cursor()

print "Content-type: text/html"
print
print "<title>Updating CCID</title>"

form = cgi.FieldStorage()
ccid = form.getvalue('ccid')

if ccid is not None:
	query = 'UPDATE OR IGNORE ' + sqlite_table + ' SET time=DATETIME("now") WHERE ccid=?'
	print query + '<br>'
	c.execute(query, (ccid,))
	query = 'INSERT OR IGNORE INTO ' + sqlite_table + ' (ccid, time) VALUES (?, DATETIME("now"))'
	print query + '<hr>'
	c.execute(query, (ccid,))

	# Committing changes
	conn.commit()

	print "<p>Refreshed timestamp for user '%s'</p>" % ccid
else:
	print "<p>No user specified</p>"
	
# Closing the connection to the database file
conn.close()
