#!/usr/bin/env python
 
import BaseHTTPServer
import CGIHTTPServer
import cgitb; cgitb.enable()  ## This line enables CGI error reporting
 
server = BaseHTTPServer.HTTPServer
handler = CGIHTTPServer.CGIHTTPRequestHandler
server_address = ("", 8080)
handler.cgi_directories = ["/s"]
 
print("Starting up http server on " + (server_address[0] if len(server_address[0]) else "localhost") + ":" + repr(server_address[1]));
 
httpd = server(server_address, handler)
httpd.serve_forever()