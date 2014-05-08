$(document).ready( function () {
	$("#terminal").on( "submit", function ( e ) {
		e.preventDefault();
		
		var data = $(this).serializeArray();

		$.ajax({
			type : "get",
			url : "http://localhost:3000/ajax",
			data : { cmd : data[0].name == "cmd" ? data[0].value : "" },
			dataType : "json"
		})
	});
});