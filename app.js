
// Your accountSid and authToken from twilio.com/user/account
var accountSid = 'ACfe2ccf1f441035f831fb78424bf4568e';
var authToken = '2e8e0735adf141b6f55c39ef963152d2';
var client = require('twilio')(accountSid, authToken);
var unirest = require('unirest');
var express = require("express");
var http = require('http');
var app = express();
var o2x = require('object-to-xml');
var qs = require('querystring');

var twiml2 = "https://api.twilio.com/cowbell.mp3";
var rickRoll = "http://demo.twilio.com/docs/voice.xml";
var search = "aaaambient";



app.get("/test", function (req, res) {
	res.set("Content-Type", "text/xml");
	res.send(o2x({
		'?xml version="1.0" encoding="utf-8"?' : null,
		Response: {
				Play: twiml2
		}
	}));

  console.log(req.query.From);
	req.setEncoding('utf8');
	var input = "" + req.query.From;
	search = "" + req.query.Body;

	var newSearch = "";
	for (var i = 0; i<search.length; i++){
		if (search.charAt(i) == ' '){
			newSearch += '+';
		}
		else {
			newSearch += search.charAt(i);
		}
	}
	console.log(req.query.Body);
	unirest.get("https://deezerdevs-deezer.p.mashape.com/search?q=" + newSearch)
	.header("X-Mashape-Key", "mpRdHHU7R9mshNH0entzFSW4Akttp1ScydejsnKby6lb2BoCeY")
	.header("Accept", "text/plain")
	.end(function (result) {
		//console.log(result.body);
		console.log("1");
		//console.log(result.body.data);
		console.log("2");
		//console.log(result.body.total);
		//console.log(twiml2);
		//console.log(newSearch);
		console.log("3");
		// Checks if the song is found or not
		if (result === null || result.body.total <= 0) {
			twiml2 = rickroll;
		}
		else {
			console.log(twiml2);
			twiml2 = result.body.data[0].preview;
		}
		console.log(twiml2);
		console.log("4");
		if (input != null && typeof input == "string"){
			//console.log(input);
			//console.log(twiml2 + " something");
			client.calls.create({
				to: input,
				from: "+16476910582",
				url: twiml2,
				method: "GET",
				fallbackMethod: "GET",
				statusCallbackMethod: "GET",
				record: "false"
			}, function(err, call) {
				console.log(call.sid);
			});

		} else {
				console.log(input);
				client.messages.create({
							body: input + " error",
							to: "+16476187893",
							from: "+16476910582"
					}, function(err, message) {
						console.log(err);
							//process.stdout.write(message.sid);
					});
		}
	});


// client.messages.create({
// 			body: input + " no error",
// 			to: input,
// 			from: "+16476910582"
// 	}, function(err, message) {
// 		console.log(err);
// 		//process.stdout.write(err);
// 	});

});

var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 8080);
//Start server
app.listen(port, host);
// http.createServer(app).listen(port,function(){
// 	console.log("Listening on port " + port);
// });
