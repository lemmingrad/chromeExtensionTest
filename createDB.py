#!/usr/bin/env python
 
import sqlite3

sqlite_file = 'ccid.sqlite'    # name of the sqlite database file
sqlite_table = 'ccid_table'

# Connecting to the database file
conn = sqlite3.connect(sqlite_file)
c = conn.cursor()

# Creating a new SQLite table with 1 column
c.execute('CREATE TABLE %s ( ccid TEXT PRIMARY KEY, time INTEGER )' % (sqlite_table))
c.execute('INSERT INTO %s (ccid, time) VALUES ( "mneve", datetime("now") )' % (sqlite_table))

# Committing changes and closing the connection to the database file
conn.commit()
conn.close()

print 'Created table ' + sqlite_table
