#!/c/Python27/python
# -*#!C:\Python27\python.exe -u
# -*#!/usr/bin/env python

import sqlite3

sqlite_file = 'ccid.sqlite'    # name of the sqlite database file
sqlite_table = 'ccid_table'

conn = sqlite3.connect(sqlite_file)
c = conn.cursor()

print "Content-type: text/html"
print
print "<title>List CCIDs</title>"

query = 'SELECT * FROM %s ORDER BY time ASC' % (sqlite_table)
print query + '<hr>'

for row in c.execute(query):
	print row
	print "<br>"
	
conn.close()
