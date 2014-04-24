/**
 * Botany.js / arborist.js ?? arbor.js ??
 *
 * API for making pretty tree graphs
 *
 * requires jQuery
 *
 * created by Jon Brennecke / https://github.com/jonbrennecke
 *
 */


/**
 * Tree object
 *
 * @param parent - jQuery element over which to create the Tree
 */

function Tree ( parent ) {

	this.parent = parent;
	this.nodes = [];
	this.root = null;
	this.canvas = $( "<canvas class='botany__bg'></canvas>" ).appendTo( parent ).get(0);
	this.ctx = this.canvas.getContext('2d');

	this.canvas.width = this.parent.width();
	this.canvas.height = this.parent.height();

	// the canvas will redraw every time the window is resized
	$( window ).resize( this.resize.bind( this ) );

	// nodes will listen for the 'botany__clickout' event
	this.clickout = new Event('botany__clickout');

	parent.get(0).addEventListener( 'click', this.click.bind( this ), false );


};

Tree.prototype = {

	/**
	 * add a new node to the tree
	 *
	 */
	seed : function () { 
		var i = this.nodes.push( new Node( this ) );

		// if there is no root node, add this node as the root
		if ( !this.root ) 
			this.root = this.nodes[ i - 1 ];
		
		return this.nodes[ i - 1 ];
	},


	/**
	 * DFS (Depth First Search)
	 *
	 * @param callback - function callback ( parent, child ) 
	 * 		 - for each node that is visited, the callback function is 
	 * 		   called once for each of the node's children
	 * 
	 */
	walk : function ( callback ) {
		var stack = [];

		// starting from the root node
		stack.push( this.root );

		// search loop
		while ( stack.length ) {
			var v = stack.pop();
			if ( !v.discovered ) {
				for ( var i = 0; i < v.children.length; i++ ) {
					stack.push( v.children[i] );
					callback.call(this, v, v.children[i], i )
				};
			};
		};
	},

	/**
	 * apply 'callback' to each node in the Tree
	 *
	 */
	each : function ( callback ) {
		for (var i = 0; i < this.nodes.length; i++) {
			callback( this.nodes[i], i );
		};
	},


	/**
	 * redraw node linkages
	 *
	 * ( the tree is redrawn on every drag event of a node )
	 *
	 */
	redraw : function () {

		this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height )

		var self = this;

		this.each( function ( node ) {
			node.walk( function ( parent, field, index ) {
				self.ctx.beginPath()
				self.ctx.shadowBlur = 15;
				self.ctx.shadowColor = "#000";
				self.ctx.lineWidth = 1;
				self.ctx.strokeStyle = "rgba(0,0,0,0.25)";

				
				for (var i = 0; i < field.links.length; i++) {

					var linkPos = field.links[i].position,
						helperPos = field.links[i].helperPosition

					// draw any connected links
					for ( var j=0; j < field.links[i].children.length; j++ ) {
						var childPos = field.links[i].children[j].position;

						self.ctx.moveTo( linkPos.left, linkPos.top );
						self.ctx.quadraticCurveTo( childPos.left, linkPos.top, childPos.left, childPos.top );
						self.ctx.stroke();
					};

					// draw any links that are being dragged
					if ( helperPos.left != 10 && helperPos.top != 10 ) {
						self.ctx.moveTo( linkPos.left, linkPos.top );
						self.ctx.quadraticCurveTo( helperPos.left, linkPos.top, helperPos.left, helperPos.top );
						self.ctx.stroke();
					}
					
				};

			});

		});

	},

	/**
	 * recursively organize the graph, starting at 'parent'
	 *
	 * children are centered below their parent
	 *
	 */
	autoOrganize : function ( parent, top, left ) {

		parent.position = { top : top, left : left };

		for (var i = 0; i < parent.children.length; i++) {
			var offset = 1 / parent.children.length;
			this.autoOrganize( parent.children[i], top + 75, left + i * offset * 500 + 500 * ( ( offset - 1 ) / 2 ) );
		};
	},


	/**
	 * Delete a node 
	 *
	 * Deletes all refrences to a node in the tree. Without any references, 
	 * the node will be deleted by the garbage collector.
	 *
	 * TODO cull should be able to create its own Trees if culling a node seperates 
	 * a valid Tree from the rest of this Tree
	 */
	cull : function ( node ) {
		this.walk( function ( parent, child, index ) {
			if ( child === node ) {
				parent.children.splice( index, 1 );

				// fade out the node html and then remove its element from the DOM
				child.element.fadeOut( 300, function () {
					$(this).remove();
				});
			}
		});
	},


	/* ~~~~~~~~~~~~~~~~~ events ~~~~~~~~~~~~~~~~~ */ 


	/**
	 *
	 * called on window resize
	 *
	 */
	resize : function () {
		this.canvas.width = this.parent.width();
		this.canvas.height = this.parent.height();

		this.redraw();
	},


	/**
	 * propogate 'botany__clickout' event
	 *
	 */
	click : function ( e ) {
		if ( ! e.target.className.match( "botany__node" ) ) {
			this.parent.get(0).dispatchEvent( this.clickout )
		};
	}
};



/**
 * Node object
 *
 */

function Node ( tree ) {
	this.tree = tree;
	this.children = [];
	this.fieldlist =[];
	this.discovered = false;

	this.element = $("<div class='botany__node'></div>" )
		.appendTo( this.tree.parent )
		.draggable({
			drag : this.drag.bind( this )
		})
		.click( this.click.bind( this ) )

	this.form = $( "<form class='botany__node__fields'></form>" ).appendTo( this.element );

	this.tree.parent.get(0).addEventListener( 'botany__clickout', this.clickout.bind( this ), false );

};

Node.prototype = {

	constructor : Node,

	get position () {
		var position = this.element.position();
		return { 
			top : position.top + this.element.height() / 2,  
			left : position.left + this.element.width() / 2
		};
	},

	set position ( offset ) {
		this.element.css({ left : offset.left, top : offset.top })

			// TODO
			// .animate({ left : offset.left, top : offset.top }, { duration : 400, easing : "easeOutQuad" })
			// .promise()
			// .done( function () {
			// 	this.tree.redraw()
			// }.bind( this ) );
	},

	/**
	 * add a field to the node
	 *
	 */
	fields : function ( fields ) {

		for (var i = 0; i < fields.length; i++) {
			this.fieldlist.push( new Field( this, fields[i] ) )
			this.form.append( this.fieldlist[ this.fieldlist.length - 1 ].html() )
		};
		
	},

	/**
	 * traverse each of the node's fields with 'callback'
	 *
	 *
	 * @param callback - callback function to apply to each of the node's fields
	 *
	 */
	walk : function ( callback ) {
		for (var i = 0; i < this.fieldlist.length; i++) {
			callback( this, this.fieldlist[i], i )
		};
	},

	/**
	 * 
	 *
	 */
	addChild : function ( node ) {

		// the addChild function is called by an event listener on the new node (+) button
		// in which case, param 'node' is an event instance, not a node
		// if ( ! ( node instanceof Node ) ) {
		// 	node = this.tree.seed();
		// };

		console.log( node )

		// this.children.push( node );

		// // TODO put this somewhere else
		// this.tree.autoOrganize( this.tree.root, 10, this.tree.parent.width() / 2 )

		// this.tree.redraw();
	},

	/**
	 * unlink a node's children
	 *
	 */
	// removeChildren : function () {
	// 	while ( this.children.length ) {
	// 		var child = this.children.pop();
	// 		child.removeChildren();
	// 	}
	// },


	/**
	 *
	 * remove a node from the tree
	 */
	removeNode : function ( ) {

		this.tree.cull( this );
	},


	naviconActions : function ( ) {
		// this.element.find('.botany__addChild').click( this.addChild.bind( this ) );
		// this.element.find('.botany__removeNode').click( this.removeNode.bind( this ) );
		// this.element.find('.botany__search').click( this.search.bind( this ) );
	},

	/* ~~~~~~~~~~~~~~~~~ events ~~~~~~~~~~~~~~~~~ */ 

	drag : function () {
		this.tree.redraw()
	},

	click : function ( e ) {
		// this.element.addClass( 'botany__menu', 500, 'easeOutQuad', function () {
			
		// 	// add the navicons
		// 	this.element.append( "<div class='botany__navicon botany__addChild'>+</div>" +
		// 		"<div class='botany__navicon botany__removeNode'>-</div>" +
		// 		"<div class='botany__navicon botany__search'>&#9906;</div>" );

		// 	// and tell the navicons what to do
		// 	this.naviconActions();

		// }.bind( this ) );
	},


	/**
	* attached to the 'botany__clickout' event; removes the 'botany__menu' class 
	* and the 'botany__navicon' div elements
	*
	*/
	clickout : function ( e ) {
		this.element.find('div.botany__navicon').fadeOut().remove();
		this.element.removeClass( 'botany__menu', 150, 'easeOutQuad', function () {
			this.tree.redraw()
		}.bind( this ) );
	}

};


/**
 *
 * Field object
 *
 * @param node - parent node object
 * @param def - field definition
 */
function Field ( node, def ) {
	
	// maintain a reference to the parent node
	this.node = node;

	// store the NodeLink obects in an array
	this.links = [];

	// a field may have incoming and outgoing links
	if ( def.outgoing ) this.links.push( new NodeLink( this.node, true ) );
	if ( def.incoming ) this.links.push( new NodeLink( this.node, false ) );

	// basic field container element is a span tag
	this.element = $( "<span class='field'></span>" );

	// determine the field type
	switch ( def.type ) {
		case "number" :
			this.type = "number"
			break;
		case "array" :
			this.type = "array"
			break;
		case "string" :
			this.type = "string"
			break;
		case "color" :
			this.type = "color"
			break;
		default :
			break;
	}

	// if the 'label' is defined, append it to the element within a paragraph tag
	if ( def.label ) {
		this.label = def.label;
		$("<p class='field__label'>" + this.label + "</p>").appendTo( this.element )
	};

	// add all the link elements
	for (var i = 0; i < this.links.length; i++) {
		this.element.append( this.links[i].html() )
	};
};

Field.prototype = {

	/**
	 *
	 * @return - jQuery element
	 */
	html : function () {
		return this.element
	}

};


/**
 *
 *
 * @param out (boolean) - whether the node is outgoing (true) or incoming (false)
 */
function NodeLink ( node, out ) {
	
	// maintain a reference to the parent node
	this.node = node;
	this.children = [];

	this.element = $( "<a class='node__link " + ( out ? "outgoing" : "incoming" ) + "'></a>" );
	this.element.click( this.click.bind( this ) );
	this.element.get(0).data = this;

	this.helperElement = $( "<a class='node__link helper' draggable='true'></a>");

	this.element.draggable({
		drag : this.drag.bind( this ),
		helper : this.helper.bind( this ),
		stop : this.stop.bind( this ),
		revert : 'invalid',
		revertDuration : 100,
		snap : '.node__link',
		snapMode : 'inner'
	}).droppable({
		accept : ".node__link",
		drop : this.drop.bind( this )
	})
};

NodeLink.prototype = {

	constructor : NodeLink,

	get position () {
		var offset = this.element.offset();
		return { top : offset.top + 10, left : offset.left + 10 }
	},

	set position ( offset ) {
		// TODO
	},

	get helperPosition () {
		var offset = this.helperElement.offset();
		return { top : offset.top + 10, left : offset.left + 10 }
	},

	set helperPosition ( offset ) {
		// TODO
	},
	
	/**
	 *
	 * @return - jQuery element
	 */
	html : function () {
		return this.element
	},

	helper : function () {
		return this.helperElement;
	},

	/**
	 * Connect the nodes
	 *
	 */
	connect : function ( node ) {
		this.children.push( node );

		node.element.draggable( "disable" );
		// this.
		this.node.tree.redraw()
	},

	/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ events ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

	drag : function () {
		this.node.tree.redraw();
	},

	stop : function ( ) {
		this.node.tree.redraw();
	},

	/**
	 *
	 * called when an 'acceptable' droppable is dropped over the element
	 *
	 */
	drop : function ( e, ui ) {

		// reset the draggable
		// if this doesn't happen, tree.redraw() will draw curves to both the helper and the linked node
		ui.helper.offset( { top : 0, left : 0 } );

		// if a NodeLink is dropped, connect the nodes
		if ( ui.draggable.get(0).data instanceof NodeLink ) {
			ui.draggable.get(0).data.connect( this );
		}
	},

	click : function ( e, ui ) {
		
	}
};


/**
 * jQuery plugin
 *
 * @return Tree object
 */

$.fn.tree = function ( options ) {
	return new Tree( this )

	// return $( this ).each( function ( ) {
		
	// 	// init the tree
	// 	new Tree( this ).seed()

	// });
}