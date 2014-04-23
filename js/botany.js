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
	 * redraw node linkages
	 *
	 * ( the tree is redrawn on every drag event of a node )
	 *
	 */
	redraw : function () {

		this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height )

		this.walk( function ( parent, child ) {
			this.ctx.beginPath()
			this.ctx.shadowBlur = 15;
			this.ctx.shadowColor = "#000";
			this.ctx.lineWidth = 1;
			this.ctx.strokeStyle = "rgba(0,0,0,0.25)";
			this.ctx.moveTo( parent.position.left, parent.position.top );
			this.ctx.quadraticCurveTo( child.position.left, parent.position.top, child.position.left, child.position.top )
			this.ctx.stroke()
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
		if ( ! e.target.className.match( "node" ) ) {
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
	this.discovered = false;

	this.element = $("<div></div>")
		.appendTo( this.tree.parent )
		.addClass('node')
		.draggable({
			drag : this.drag.bind( this )
		})
		.click( this.click.bind( this ) )

	this.tree.parent.get(0).addEventListener( 'botany__clickout', this.clickout.bind( this ), false );

	this.searchEvent = new CustomEvent( 'botany__search', { detail : { node : this } });

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
	 * 
	 *
	 */
	search : function () {
		document.getElementById('menu').dispatchEvent( this.searchEvent )
	},

	addChild : function ( node ) {

		// the addChild function is called by an event listener on the new node (+) button
		// in which case, param 'node' is an event instance, not a node
		if ( ! ( node instanceof Node ) ) {
			node = this.tree.seed();
		};

		this.children.push( node );

		// TODO put this somewhere else
		this.tree.autoOrganize( this.tree.root, 10, this.tree.parent.width() / 2 )

		this.tree.redraw();
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
		this.element.find('.botany__addChild').click( this.addChild.bind( this ) );
		this.element.find('.botany__removeNode').click( this.removeNode.bind( this ) );
		this.element.find('.botany__search').click( this.search.bind( this ) );
	},

	/* ~~~~~~~~~~~~~~~~~ events ~~~~~~~~~~~~~~~~~ */ 

	drag : function () {
		this.tree.redraw()
	},

	click : function ( e ) {
		this.element.addClass( 'botany__menu', 500, 'easeOutQuad', function () {
			
			// add the navicons
			this.element.append( "<div class='botany__navicon botany__addChild'>+</div>" +
				"<div class='botany__navicon botany__removeNode'>-</div>" +
				"<div class='botany__navicon botany__search'>&#9906;</div>" );

			// and tell the navicons what to do
			this.naviconActions();

		}.bind( this ) );
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