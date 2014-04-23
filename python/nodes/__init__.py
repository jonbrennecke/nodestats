#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
from nodes import *
from tree import *



class NodeManager( object ) :

	"""

	handles requests for nodes from the NodeJS client, and serializes node fields
	
	"""

	def __init__( self ):
		super( NodeManager, self ).__init__()


	# return the node
	# 
	# @param node - dict of data about the node
	# @return - node instance
	def getNode( self, node ) :

		# lookup the node in a dict
		nodeObj = {
			"file" : lambda : FileNode( node['id'] ), 
			"csv" : lambda : CSVNode( node['id'] ),
			"interval" : lambda : NodeBase( node['id'] )
		}.get( node['name'], lambda : NodeBase( node['id'] ) )()

		return nodeObj.stringify()


	def open( self, data ) :
		tree = XMLTree()
		tree.read( data )
		tree.computeRoot()