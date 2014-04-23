/**
*
* WebSocket Client Server
*
*
*/

function WSClient( host, port ) {

	this.connection = new WebSocket('ws://' + host + ':' + port + '/websocket');

	this.connection.onopen = this.open;
	this.connection.onmessage = this.response;

};

WSClient.prototype = {

	// called immediately on open
	open : function () {

	},

	// send a string of encoded data to the python host
	send : function ( msg ) {
		this.connection.send( msg )
	},

	// handle responses from the server
	response : function ( event ) {
		if ( event instanceof MessageEvent ) {

			var data = $.parseJSON( event.data );

			var node = new Node( data );

		};
	}
};


/**
 * Application Manager
 *
 */

function Application () {
	this.wsclient = new WSClient( 'localhost', '8888' );

	document.getElementById('menu').addEventListener('botany__search', this.search, false );
};

Application.prototype = {

	// send the (stringified) node data to Python
	// TODO inconsistent with 'get'; remove this
	getNode : function ( node, id ) {
		this.wsclient.send( JSON.stringify( { "type" : "node", "name" : node, "id" : id } ) );
	},

	get : function ( json ) {
		this.wsclient.send( JSON.stringify( json ) );
	},

	// create an open file dialog and send the return to Python
	open : function () {

		var input = $('#hiddenFileDialog').get(0), self = this;

		input.addEventListener("change", function ( e ) {
			self.wsclient.send( JSON.stringify( { "type" : "open", "data" : this.value } ) );
	    }, false);

	    input.click();  
	},

	search : function ( e ) {

		$( "#search" ).fadeIn(500)


		// console.log( e.detail.node )
	}

};

