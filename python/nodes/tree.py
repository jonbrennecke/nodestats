#!/usr/bin/python
# -*- coding: utf-8 -*-

import xml.etree.ElementTree as et
import re
from xmlnodes import *



class Tree( object ) :

	"""

	DFS (Depth-First Search) tree data structure

	main class for running the algorithm

	TODO consider implementing comparison ops __lt__, __gt__ for nodes

	
	"""

	def __init__( self ):
		super( Tree, self ).__init__()
		self.nodes = []


	def computeRoot( self ) :

		"""

		begin computing the root node of the tree
		
		"""

		search = self.dfs()

		for node in reversed( search ) : 
			if node.compute() :
				continue


	def dfs( self ) :

		"""

		simple DFS algorithm

		"""

		stack = []
		search = []

		# ignore the 'root' node and start the stack with the last relevant node
		stack.append( self.nodes[-2] )
		
		# simple search loop
		while stack :
			v = stack.pop() 
			if v.discovered is not True :
				v.discovered = True;
				for node in v.inputs.itervalues() :
					nodes = [ link.parent for link in node.links ]
					stack.extend( nodes )
					search.extend( nodes )

		return search




# parses the XML Tree into a linked-list of Nodes
class XMLTree( Tree ) :

	"""

	Main handler for XML file reading/writing

	inherits from Tree

	TODO make an XML Exception class

	"""

	def __init__( self ):
		super( XMLTree, self ).__init__()


	def read( self, path ) :

		print " >> opening XML file from " + path

		#  parse xml
		self.xml = et.parse( path )

		root = self.xml.getroot()
		
		if root.tag is not 'nodemap' :
			# invalid xml exception
			pass

		# loop through node definitions
		for xml in root :

			# pass the XML node to 'mkNode' to construct a node object 
			node = self.mkNode( xml )

			if node is not None :
				self.nodes.append( node )
			
		# once the nodes have been processed, we need to link them
		for node in self.nodes :
			self.link( node )



	# construct links for the node
	def link( self, node ) :

		# filter outgoing link nodes from the node's children
		for link in [ child for child in node.node if child.tag == "out" ] :

			# a regexp that groups anything before and after a ':'
			regexp = re.search( '(.*?)(?::)(.*)', link.attrib['to'] )

			# find the link target
			target = self.find( regexp.group( 1 ) )

			# link the node to the corresponding input slot of the target
			node.out( regexp.group( 2 ), target )



	# search self.nodes for a *single* node with matching 'id'
	def find( self, id ) :
		return next( n for n in self.nodes if n.id == id )


	# search self.nodes for *all* nodes with matching 'id'
	def findall( self, id ) :
		return [ n for n in self.nodes if n.id == id ]		


	# construct python objects from XML tags
	def mkNode( self, xml ) :
		return {
			'csv' : lambda : XMLCSVNode( xml ),
			'edf' : lambda : XMLEDFNode( xml ),
			'interval' : lambda : XMLIntervalNode( xml ),
			'excel' : lambda : XMLExcelNode( xml ),
			'root' : lambda : XMLRootNode( xml ) 
		}.get( xml.tag, lambda : None )()