/**
 * grid background
 *
 */

function Grid( spacing, parent ){

	this.spacing = spacing;

	this.parent = $( parent );

	this.canvas = $( "<canvas class='grid'></canvas>" ).appendTo( parent ).get(0);
	this.ctx = this.canvas.getContext('2d');

	this.canvas.width = this.parent.width();
	this.canvas.height = this.parent.height();

	// the canvas will redraw every time the window is resized
	$( window ).resize( this.resize.bind(this) );

	this.draw()
};


Grid.prototype = {

	// dynamically draw the grid to fit the canvas size
	draw : function() {

		this.ctx.beginPath();
		this.ctx.strokeStyle = "rgba(0,0,0,0.1)"
		this.ctx.lineWidth = 1;

		for (var i = 1; i < Math.max( this.canvas.width, this.canvas.height ) / this.spacing; i++) {
			if ( i < this.canvas.width ) {
				this.ctx.moveTo( i * this.spacing, 0 );
				this.ctx.lineTo( i * this.spacing, this.canvas.height );
			}

			if ( i < this.canvas.height ) {
				this.ctx.moveTo( 0, i * this.spacing );
				this.ctx.lineTo( this.canvas.width, i * this.spacing );
			};
		};

		this.ctx.stroke();

	},

	// resize the canvas to match the editor's size and redraw the grid
	resize : function () {
		this.canvas.width = this.parent.width();
		this.canvas.height = this.parent.height();
		this.draw()
	}
};

/**
* jQuery plugin for 'grid'
*
*/
$.fn.grid = function ( options ) {
	return $(this).each( function ( ) {
		new Grid( options.spacing || 30, this )
	});
}