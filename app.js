/*
 * starts an Express.js webserver on port 3000 which serves the "public" folder.
 */

var express = require('express'),
    bodyParser = require('body-parser'),
	app = express(),
    sys = require('sys'),
    exec = require('child_process').exec;

app.use(bodyParser());
// app.use(express.urlencoded());

// declare a function to print stdout to the console
function puts(error, stdout, stderr) { 
	console.log(error, stdout) 
}

// render & serve 'public/haml/index.haml' as the root file
app.get('/', function(req, res){

	exec("haml public/haml/index.haml", function ( error, html ) {
		res.send( html );
	});
 
  // update stylesheet on every page request
  // TODO: development version only
  //exec("sass --update ./public/stylesheets/style.scss:./public/stylesheets/style.css", puts )

});

app.get('/ajax', function ( req, res ) {
	exec( req.body.cmd, puts )
});

// serve static files from the /public/ folder
app.use( express.static( __dirname + '/public/') );

app.listen(3000);