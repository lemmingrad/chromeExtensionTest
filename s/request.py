#!/c/Python27/python
# -*#!C:\Python27\python.exe -u
# -*#!/usr/bin/env python

import sqlite3
import subprocess

ccollab = 'C:\Program Files\Collaborator Client\ccollab'
admin = 0
use_minhold = 0
minhold = 5 * 60

sqlite_file = 'ccid.sqlite'    # name of the sqlite database file
sqlite_table = 'ccid_table'

conn = sqlite3.connect(sqlite_file)
c = conn.cursor()

print "Content-type: text/html"
print
print "<title>Release CCID</title>"

if 1 == use_minhold:
	query = 'SELECT ccid FROM ' + sqlite_table + ' WHERE (strftime("%s","now") - strftime("%s",time)) > ? ORDER BY time ASC'
	print query + '<br>'
	c.execute(query, (minhold,))
	r = c.fetchone()

	for row in c.execute(query, (minhold,)):
		print row
		print "<br>"
else:
	query = 'SELECT ccid FROM ' + sqlite_table + ' ORDER BY time ASC'
	print query + '<br>'
	c.execute(query)
	r = c.fetchone()

	for row in c.execute(query):
		print row
		print "<br>"

if r is not None:
	rs = r[0]

	if admin == 1:
		cmd = ccollab + ' admin user edit ' + rs + ' --enabled false'

		print 'Shell: ' + cmd + '<br>'
		exit_status1 = subprocess.call(cmd)
		print '<br>Return: ' + repr(exit_status1) + '<br>'
		
		cmd = ccollab + ' admin user edit ' + rs + ' --enabled true'

		print 'Shell: ' + cmd + '<br>'
		exit_status2 = subprocess.call(cmd)
		print '<br>Return: ' + repr(exit_status2) + '<br>'
	else:
		cmd = ccollab + ' logout'

		print 'Shell: ' + cmd + '<br>'
		exit_status1 = subprocess.call(cmd)
		print '<br>Return: ' + repr(exit_status1) + '<br>'
		
		exit_status2 = 0
	
	if exit_status1 == 0 and exit_status2 == 0:
		query = 'DELETE FROM ' + sqlite_table + ' WHERE ccid=?'
		print query + '<hr>'
		c.execute(query, (rs,))		

		conn.commit()

		print "<p>Released user '%s'</p>" % rs
	else:
		print "<p>Failed to perform shell task.</p>"
else:
	print "<p>No users available for release.</p>"

conn.close()

