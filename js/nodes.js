/**
 * Front-end display of a node
 *
 *
 * recieves a response from the python server as a JSON object,
 * and parses the response to create a Node display
 *
 * @param options = {
 * 	fields : JSON, 
 * 	inputs : JSON,
 * 	outputs : JSON,
 * 	id : <string>	
 * }
 *
 */

function Node ( options ) {

	// this.element = $( "#" + options.id );
	// this.options = options;

	// create a globally unique id 
	var uuid = guid();

	// append node element
	this.element = $("<div class='node'>" + 
		"<div class='inputs'></div>" +
		"<div class='fields'></div>" +
		"<div class='outputs'></div>" +
		"</div>" )
		.appendTo("#editor")
		.draggable({ confinement : 'parent', handle : 'div.fields' })
		.resizable()
		.attr( "id", uuid );

	// animate in
	this.element.addClass('undefined', 500, 'easeOutQuad');

	// set position
	if ( options && options.position ) { 
		this.element.offset( options.position );
	};

	// add default options
	this.options = {
		id : uuid,
		inputs : { "add" : "default" },
		outputs : { "add" : "default" }
	};
	
	
	this.links = [];
	this.redraw();

};

Node.prototype = {

	redraw : function () {
		this.doFields();
		this.doInputs();
		this.doOutputs();
	},
	
	doFields : function () {

		var form = "<form>";

		for ( var field in this.options.fields ) {
			switch ( this.options.fields[ field ].type ) {
				case 'open-file-dialog' : 
					
					// add an open file dialog
					form += "<label for='fileDialog'>" + field + "</label><input id='fileDialog' type='file' />";

					break;
				default :
					break;
			}
		};

		return $( form ).appendTo( this.element.find('.fields') );
	},

	doInputs : function () {
		return this.doIO( this.options.inputs, this.element.find('.inputs') );
	},

	doOutputs : function () {
		return this.doIO( this.options.outputs, this.element.find('.outputs') );
	},

	doIO : function ( data, element ) {

		// create the IO bullet

		var ul = "<ul>", self = this;

		for ( var key in data ) {
			ul += "<li class='anchor'><h1>" + key + "</h1></li>";
		};

		ul += "</ul>";

		var list = $( ul ).appendTo( element );


		// add actions

		var bullets = list.find('li')
			.hover( 
				
				// mouseenter
				function () {
					$( this ).find( 'h1' ).fadeIn();
				},

				// mouseleave
				function () {
					$( this ).find( 'h1' ).fadeOut();	
				
				})
			.each( function () {
				console.log(element)
				self.links.push( new NodeLink( self, this, $(this).find('h1').text() ) );
			})

		return list;

	}
};



/**
* Link between node inputs/outputs
*
*/

function NodeLink ( node, bullet, role ) {

	this.node = node;
	this.role = role;
	this.bullet = $( bullet );
	this.dragBullet = $('<div class="nodelink"><canvas></canvas></div>');
	this.canvas = this.dragBullet.find('canvas');
	this.ctx = this.canvas[0].getContext('2d');

	this.dragBullet
		.appendTo( bullet )
		.draggable({
			containment : $('#editor'),
			drag : this.drag.bind( this ),
			stop : this.stop.bind( this ),
			refreshPositions : true
		});
		
	this.bullet	
		.droppable({
			accept : '.nodelink',
			activate : this.activate.bind( this )
		})
};

NodeLink.prototype = {

	// called on drag
	drag : function ( e, ui ) {

		var dist = this.dist();

		this.canvas[0].width = dist.left;
		
		// meaning we're below the anchor bullet
		if ( dist.top > 0 ) {
			this.canvas[0].height = dist.top;
			this.canvas[0].style.marginTop = - dist.top + 'px';
		};

		$(this.bullet).addClass("drag");

		this.curve();

	},

	// draw a quadrratic curve between the bullets
	curve : function () {
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = "rgba(0,0,0,0.25)";
		this.ctx.moveTo( 0, 10 );
		this.ctx.quadraticCurveTo( this.canvas[0].width - 10, 10, this.canvas[0].width, this.canvas[0].height );
		this.ctx.stroke()
	},

	// called on revert
	revert : function ( ) {
		// return true to revert the element
		return true
	},

	// called when the drag motion stops
	stop : function ( e, ui ) {

		var node = new Node( { position : { top : ui.offset.top - 16, left : ui.offset.left + 7 } });

		
	},

	// calculate the distance between the  and the bullet
	dist : function () {
		return { 
			left : this.dragBullet.offset().left - this.bullet.offset().left,
			top : this.dragBullet.offset().top - this.bullet.offset().top
		}
	},

	// 'light up' when an acceptable draggable is being dragged
	activate : function ( e, ui ) {
		this.bullet.addClass( "lightup" );
	}

};








