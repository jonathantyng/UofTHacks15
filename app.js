// app.js

// Your accountSid, authToken, and twilio number from twilio.com/user/account
var accountSid = '[Account Sid]';
var authToken = '[Authorization Code]';
var twilioNumber = '+1[twilio-number]';

// Obtaining all required node.js modules
var client = require('twilio')(accountSid, authToken);
var unirest = require('unirest');
var express = require("express");
var http = require('http');
var o2x = require('object-to-xml');
var qs = require('querystring');

var app = express();

// Defaults (Fallbacks)
var twiml2 = "https://api.twilio.com/cowbell.mp3";
var rickroll = "http://demo.twilio.com/docs/voice.xml";
var search = "aaaambient";

app.get("/test", function (req, res) {
	res.set("Content-Type", "text/xml");
	res.send(o2x({
		'?xml version="1.0" encoding="utf-8"?' : null,
		Response: {
			Play: twiml2
		}
	}));

	req.setEncoding('utf8');

	// Get user's input (song name + artist)
	var input = "" + req.query.From;
	search = "" + req.query.Body;
	var newSearch = "";

	// Eliminate spaces
	for (var i = 0; i<search.length; i++){
		if (search.charAt(i) == ' ') {
			newSearch += '+';
		}
		else {
			newSearch += search.charAt(i);
		}
	}

	// Requests Deezer API
	unirest.get("https://deezerdevs-deezer.p.mashape.com/search?q=" + newSearch)
	.header("X-Mashape-Key", "mpRdHHU7R9mshNH0entzFSW4Akttp1ScydejsnKby6lb2BoCeY")
	.header("Accept", "text/plain")
	.end(function (result) {
		var isError = false;
		
		// Song is not found
		if (result === null || result.body.total <= 0 || result.body.data[0].preview === null) {
			twiml2 = rickroll;
			isError = true;
		}
		// Song is found
		else {
			twiml2 = result.body.data[0].preview;
		}

		// Make the call to the client 
		if (input != null && typeof input == "string" &&
		   twiml2 != null && typeof twiml2 == "string"){
			client.calls.create({
				to: input,
				from: twilioNumber,
				url: twiml2,
				method: "GET",
				fallbackMethod: "GET",
				statusCallbackMethod: "GET",
				record: "false"
			}, function(err, call) {
				console.log(call.sid);
				
				// Sends the user a text message if the song was not found
				if (isError){
				client.messages.create({
							body: "Your song was not found! :c",
							to: input,
							from: twilioNumber
					}, function(err2, message) {
						console.log("error: " + err2);
							//process.stdout.write(message.sid);
					});
				}
			});
		} 
		// Send an error message
		else {
			client.messages.create({
				body: input + " error",
				to: input,
				from: twilioNumber
			}, function(err, message) {
				console.log(err);
			});
		}
	});
});

// Starts the server and listen for inputs
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 8080);
//Start server
app.listen(port, host);
