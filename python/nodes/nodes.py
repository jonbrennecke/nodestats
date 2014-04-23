#!/usr/bin/env python

import json



"""

Basic Node Classes

TODO make a Node Exception class


"""




class NodeBase( object ):

	"""
	
	base class for creating Nodes; this class shouldn't be instantiated directly
	
	"""

	def __init__( self, id ):
		super( NodeBase, self ).__init__()
		
		self.id = id
		self.inputs = {}
		self.outputs = {}
		self.fields = {}

		# for DFS search algorithm
		self.discovered = False


	def stringify( self ) :

		"""

		format the node fields into a JSON string

		TODO: this function could just be __str__
		
		"""

		return json.dumps({ 
			"inputs" : self.inputs,
			"outputs" : self.outputs,
			"fields" : self.fields,
			"id" : self.id
		})


	def out( self, key, target ) :

		"""

		add an outgoing link to another node, and validate that the link is possible

		"""

		# find if the key matches one of the target's input keys or link scope value
		inlink = None

		if key in target.inputs :
			inlink = target.inputs[ key ]
		else :
			try :
				inlink = next( link for link in target.inputs.itervalues() if key == link )
			except StopIteration :
				pass

		# apply the same process to find outgoing link
		outlink = None

		if key in self.outputs :
			outlink = self.outputs[ key ]
		else :
			try :
				outlink = next( link for link in self.outputs.itervalues() if key == link )
			except StopIteration :
				pass


		# if validated in both directions, link the nodes
		if inlink and outlink :
			inlink.push( outlink )



	def compute( self ) :
		# exception with message "This method should be replaced in inheriting classes"
		return False




class NodeLink( object ):

	"""
	
	for linking inputs and outputs of nodes

	one node may have several nodes to which it links

	"""

	def __init__( self, parent, scope=None ):
		super( NodeLink, self ).__init__()
		self.parent = parent
		self.scope = scope
		self.value = None
		self.links = []


	def __eq__( self, other ) :
		
		# compare scope values if other is a string
		if isinstance( other, str ) : 
			return ( True if self.scope == other else False )

		# compare identity if other is a NodeLink instance
		elif isinstance( other, Nodelink ) :
			return ( True if other is self else False )

		else :
			return False


	def set( self, value ) :
		self.value = value

	# TODO add these

	# def __set__( self, instance, value ) :
	# 	print value


	# def __get__( self, instance, owner ) :
	# 	return self.value


	def push( self, target ) :
		self.links.append( target )



class CSVNode( NodeBase ) :

	"""

	for interpreting CSV (comma seperated values) table data 

	@inputs raw - raw file data
	@outputs header - header row
	@outputs array - array of formatted data

	"""

	def __init__( self, id ):
		super( CSVNode, self ).__init__( id )

		self.inputs = {
			'raw' : Nodelink( self, scope='' )
		}

		self.outputs = {
			'header' : Nodelink( self, scope='' ),
			'array' : Nodelink( self, scope='' )
		}

		

class IntervalNode( NodeBase ) :

	"""

	for selecting a sub-interval of an array

	@inputs data - array of data
	@outputs data - subarray of data in intervals
	@fields - interval 

	"""

	def __init__( self, id ) :
		super( IntervalNode, self ).__init__( id )

		self.inputs = {
			'data' : NodeLink( self, scope='data' )
		}

		self.outputs = {
			'data' : NodeLink( self, scope='data' )
		}

		self.fields = {
			"interval" : None
		}


	def compute( self ) :
		print self
		return False


class ExcelNode( NodeBase ) :

	"""

	for outputting data to Excel


	"""

	def __init__( self, id ):
		super( ExcelNode, self ).__init__( id )

		self.inputs = {
			'data' : NodeLink( self, scope='data' )
		}

		self.fields = {
			"test" : None
		}



class RootNode( NodeBase ) : 

	"""

	root node for DFS search

	TODO if no Root Node is inserted, the Tree should find a node with no 
	outputs, only inputs and assign it the root node

	"""
	def __init__( self, id ):
		super( RootNode, self ).__init__( id )

		self.inputs = {
			'in' : None
		}
		
		
