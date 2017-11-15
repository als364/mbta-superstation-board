# Python 3
from http.server import HTTPServer, SimpleHTTPRequestHandler
from io import StringIO
from os import curdir, sep
import csv
import json
import urllib.request

class GetCSVHandler(SimpleHTTPRequestHandler):
	def do_POST(self):
		# We're grabbing the CSV on the server side because it's not available
		# for CORS, so the browser can't grab it
		if self.path == '/poll':
			# Grab the text of the CSV
			url = 'http://developer.mbta.com/lib/gtrtfs/Departures.csv'
			response = urllib.request.urlopen(url)
			data = response.read()
			text = data.decode('utf-8')

			# csv has a handy DictReader, but that requires something iterable,
			# so we use StringIO to load it the csv text into a buffer
			buff = StringIO(text)
			dict_reader = csv.DictReader(buff)

			# Dump all the dicts into an aray
			dicts = [];
			for line in dict_reader:
				dicts.append(line)

			# Send the request back to the client...
			self.send_response(200)
			self.end_headers()
			# ...and write the JSONified dicts to it
			self.wfile.write(json.dumps(dicts).encode())

	def do_GET(self):
		print(self.path)
		if self.path == '/':
			self.path ='/board.html'
			self.do_GET()
		super().do_GET()

def run():
	try:
		print('Starting server on port 8000...')
		server_address = ('127.0.0.1', 8000)
		httpd = HTTPServer(server_address, GetCSVHandler)
		print('Running server...')
		httpd.serve_forever()
	except KeyboardInterrupt:
		print('Shutting down server...')
		httpd.socket.close()

run()