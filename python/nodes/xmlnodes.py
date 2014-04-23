from nodes import *
from edf import *

"""

XML Nodes

"""

# parse comma seperated values
class XMLEDFNode( EDFNode ):
	def __init__( self, node ) :
		super( XMLEDFNode, self ).__init__( node.attrib['id'] )
		self.node = node;

		self.fields['file']['value'] = node.attrib['src']


# parse comma seperated values
class XMLCSVNode( CSVNode ):
	def __init__( self, node ) :
		super( XMLCSVNode, self ).__init__( node.attrib['id'] )
		self.node = node;


# select a sub-interval of a node
class XMLIntervalNode( IntervalNode ):
	def __init__( self, node ) :
		super( XMLIntervalNode, self ).__init__( node.attrib['id'] )
		self.node = node;


# output to Excel
class XMLExcelNode( ExcelNode ):
	def __init__( self, node ) :
		super( XMLExcelNode, self ).__init__( node.attrib['id'] )
		self.node = node;


# output to Excel
class XMLRootNode( RootNode ):
	def __init__( self, node ) :
		super( XMLRootNode, self ).__init__( node.attrib['id'] )
		self.node = node;


