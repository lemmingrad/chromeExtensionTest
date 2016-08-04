#!/c/Python27/python
# -*#!C:\Python27\python.exe -u
# -*#!/usr/bin/env python

import sqlite3
import subprocess

ccollab = 'C:\Program Files\Collaborator Client\ccollab'

sqlite_file = 'ccid.sqlite'    # name of the sqlite database file
sqlite_table = 'ccid_table'

conn = sqlite3.connect(sqlite_file)
c = conn.cursor()

print "Content-type: text/html"
print
print "<title>Releasing CCID</title>"

query = 'SELECT ccid FROM ' + sqlite_table + ' ORDER BY time ASC'
print query
c.execute(query)
r = c.fetchone()

if r is not None:
	rs = r[0]

	cmd = ccollab + ' logout'
	print '<br>Shell: ' + cmd + '<br>'
	exit_status = subprocess.call(cmd)
	print '<br>Return: ' + repr(exit_status)
	
	if exit_status is 0:
		query = 'DELETE FROM ' + sqlite_table + ' WHERE ccid=?'
		print '<br>' + query
		c.execute(query, (rs,))		

		conn.commit()

		print "<hr><p>Released user '%s'</p>" % rs
	else:
		print "<hr><p>Failed to perform shell task.</p>"
else:
	print "<hr><p>No users available for release.</p>"

conn.close()

