#!/usr/bin/env python



"""

server.py

@see https://github.com/facebook/tornado/blob/master/demos/websocket/chatdemo.py

"""



import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import os.path
import uuid
import json

from tornado.options import define, options
from nodes import NodeManager


define("port", default=8888, help="run on the given port", type=int)



class Application( tornado.web.Application ):

	"""
	Main Application
	"""

	def __init__(self):
		handlers = [
			(r"/websocket", WSServer),
		]
		settings = dict(
			cookie_secret="1234",
			template_path=os.path.join(os.path.dirname(__file__), "templates"),
			static_path=os.path.join(os.path.dirname(__file__), "static"),
			xsrf_cookies=True,
		)
		tornado.web.Application.__init__(self, handlers, **settings)




class WSServer( tornado.websocket.WebSocketHandler, NodeManager ) :
	
	"""

	HTML5 Websocket Server

	inherits from NodeManager in 'nodes.py'

	"""

	def open(self):
		print "WebSocket opened"

	# handle input from Node.js
	def on_message( self, message ) :

		# unstringify the JSON message
		data = json.loads( message )

		if data['type'] == 'node' :
			self.write_message( self.getNode( data ) )

		# open an XML file
		elif data['type'] == 'open' :
			self.openFile( data )

		else :
			print message


	def on_close( self ):
		print "WebSocket closed"
