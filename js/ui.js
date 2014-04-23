var fs = require('fs'),
	express = require('express'),
	app = express(),
	mustache = require('mustache');


// ui.js

$(document).ready( function () {

	// application instance
	// var app = new Application();




	// // menu animations
	// $("#sel-opt").find('li').click( function () {	

	// 	$(".sub-menu").fadeOut(400)

	// 	// submenu slide animation
	// 	// if the sub-menu is open, defer the slide animation until the previous submenu has closed
	// 	$.when(

	// 		$("#editor").animate({ width : "80%" }, { duration : "500", easing : "easeInOutQuad" }),
	// 		$("#menu").animate({ width : "20%" }, { duration : "500", easing : "easeInOutQuad" })

	// 	).then( function () {
			
	// 		// animate sliding the editor window right
	// 		$("#editor").animate({ width : "60%" }, { duration : "500", easing : "easeInOutQuad" })
	// 		$("#menu").animate({ width : "40%" }, { duration : "500", easing : "easeInOutQuad" })

	// 		switch ( $(this).text() ) {
	// 			case "File" :
	// 				$("#file-menu").fadeIn(400).addClass("open").find('li').fadeIn(400)
	// 				break;
	// 			case "Add Node" :
	// 				$("#node-menu").fadeIn(400).addClass("open").find('li').fadeIn(400)
	// 				break;
	// 			default :
	// 				break;
	// 		}

	// 	}.bind(this));

	// });



/*	// node-menu onclick actions
	$("#node-menu").find('li').click( function () {

		var uuid = guid();

		$("<div class='node'>" + 
			"<div class='inputs'></div>" +
			"<div class='fields'></div>" +
			"<div class='outputs'></div>" +
			"</div>" )
			.appendTo("#editor")
			.draggable({ confinement : 'parent', handle : 'div.fields' })
			.resizable()
			.attr( "id", uuid )

		switch ( $(this).text() ) {
			case "EDF" :
				app.getNode( "file", uuid );
				break;
			case "CSV Node" :
				app.getNode( "csv", uuid );
				break;
			case "Interval Node" :
				app.getNode( "interval", uuid );
				break;
			default :
				break;
		}
	});*/

/*	// file-menu onclick actions
	$("#file-menu").find('li').click( function () {

		switch ( $(this).text() ) {
			case "New" :
				// app.getNode( "file", uuid );
				break;
			case "Open" :
				app.open()
				break;
			case "Save" :
				// app.getNode( "interval", uuid );
				break;
			case "Save As" :
				// app.getNode( "interval", uuid );
				break;
			default :
				break;
		}
	});
*/

});