$(document).ready( function () {

	/**
	 * 
	 *
	 * @author Jon Brennecke / https://github.com/jonbrennecke
	 */

	// var app = new Application();
		
	var tree = $( '#editor' )
		.grid({ spacing : 30 })
		.tree()

	var parent = tree.seed();

	// types: number, array, string, color

	parent.fields([{
		incoming : true,
		label : "test 1",
		type : "array",
		input : true
	},{
		outgoing : true,
		label : "test 2",
		type : "array"
	}]);

	var child = tree.seed();

	child.fields([{
		incoming : true,
		label : "test 3",
		type : "array"
	}])

	// parent.addChild( child );


	// .appendTo( '#editor' ).draggable()

	// var node = new Node();


});