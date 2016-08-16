#!/c/Python27/python
# -*#!C:\Python27\python.exe -u
# -*#!/usr/bin/env python

import sqlite3

debug = 1

sqlite_file = 'ccid.sqlite'    # name of the sqlite database file
sqlite_table = 'ccid_table'

conn = sqlite3.connect(sqlite_file)
c = conn.cursor()

print "Content-type: text/html"
print
print "<title>List CCIDs</title>"

if 1 == debug:
	query = 'SELECT * FROM %s ORDER BY time ASC' % (sqlite_table)
	print query + '<hr>'

print '<table id="results" style="border: 1px solid black; border-collapse: collapse;">'
for row in c.execute(query):
	print '<tr><td style="padding: 5px;">' + row[0] + '</td>'
	print '<td style="padding: 5px;">' + row[1] + '</td>'
	print '<td style="padding: 5px;">' + (repr(row[2]) if (row[2] >= 0) else "HOLD") + '</td></tr>'
print '</table>'
	
# Closing the connection to the database file
conn.close()
