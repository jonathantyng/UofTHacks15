// sendMessage.js
const ACC_SID = "Enter Account SID";
const AUTH_TOKEN = "Enter Authentication Token";
const TWILIO_PHONE = "Enter Twilio Phone Number";

var client = require ('twilio') (ACC_SID, AUTH_TOKEN);
var cron = require ('./cron');
var d;

// See how to use cron at https://github.com/ncb000gt/node-cron
var cronJob = cron.job('*/10 * * * * *', function (){
	d = new Date();
});
cronJob.start();
