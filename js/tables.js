$(document).ready( function () {

	/**
	 * 
	 *
	 * @author Jon Brennecke / https://github.com/jonbrennecke
	 */

	var app = new Application();
		
	var tree = $( '#editor' )
		.grid({ spacing : 30 })
		.tree()

	var parent = tree.seed();

	// var child = tree.seed();

	// parent.addChild( child );


	// .appendTo( '#editor' ).draggable()

	// var node = new Node();


});