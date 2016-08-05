#!/c/Python27/python
# -*#!C:\Python27\python.exe -u
# -*#!/usr/bin/env python

import sqlite3
import subprocess

ccollab = 'C:\Program Files\Collaborator Client\ccollab'
admin = 0
use_minhold = 0
minhold = 10 * 60

sqlite_file = 'ccid.sqlite'    # name of the sqlite database file
sqlite_table = 'ccid_table'

conn = sqlite3.connect(sqlite_file)
c = conn.cursor()

print "Content-type: text/html"
print
print "<title>Releasing CCID</title>"

if use_minhold is 1:
	query = 'SELECT ccid FROM ' + sqlite_table + ' WHERE (strftime("%s","now") - strftime("%s",time)) > ? ORDER BY time ASC'
	print query
	c.execute(query, (minhold,))
	r = c.fetchone()

	print "<br>"
	for row in c.execute(query, (minhold,)):
		print row
		print "<br>"
else:
	query = 'SELECT ccid FROM ' + sqlite_table + ' ORDER BY time ASC'
	print query
	c.execute(query)
	r = c.fetchone()

	print "<br>"
	for row in c.execute(query):
		print row
		print "<br>"

if r is not None:
	rs = r[0]

	if admin is 1:
		cmd = ccollab + ' admin user edit ' + rs + ' --enabled false'

		print '<br>Shell: ' + cmd + '<br>'
		exit_status1 = subprocess.call(cmd)
		print '<br>Return: ' + repr(exit_status1)

		cmd = ccollab + ' admin user edit ' + rs + ' --enabled true'

		print '<br>Shell: ' + cmd + '<br>'
		exit_status2 = subprocess.call(cmd)
		print '<br>Return: ' + repr(exit_status2)
	else:
		cmd = ccollab + ' logout'

		print '<br>Shell: ' + cmd + '<br>'
		exit_status1 = subprocess.call(cmd)
		print '<br>Return: ' + repr(exit_status1)
		
		exit_status2 = 0;
	
	if exit_status1 is 0 and exit_status2 is 0:
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

