var Tweet = require('../../app/models/Tweet');
var Address = require('../../app/models/Address');
var Metro = require('../../app/models/Metro');
var rest = require('../../node_modules/restler');
var mongoose = require('mongoose');
var  nodemailer = require('nodemailer');



var callback = function handleError(error) {
   if (error) {
   console.error('Custom response status:', error.statusCode);
   console.error('Custom data:', error.data);
  }
};

var sendEmail = function(handle, body){
	
	          var mailOpts, smtpTrans;
          smtpTrans = nodemailer.createTransport('SMTP', {
          	service: 'Gmail',
            	auth: {
              	user: "paul.millar@gmail.com",
              	pass: "ventura123"
            	}
          	});
          mailOpts = {
            from: 'paul@eventstak.co', //grab form data from equest body object
            to: 'paul.millar@gmail.com',
            subject: '#EVSTK tweet',
            text: handle+': '+body
          };
         smtpTrans.sendMail(mailOpts, function (error, response) {
           if (error) {
               console.log("error"+error);
           } else {
              console.log("success");
           }
				 }	
)};


module.exports = function(stream, io,twit){

  // When tweets get sent our way ...
  stream.on('data', function(data) {
		
  console.log("***logging tweet: "+data['user']['name']+" tweet:"+data['text']);
		
//***********************************
// ENABLE THIS CODE FOR PROD
//***********************************
	if (data['user']['screen_name'] == 'eventstackco') {
		console.log("Processed our own response tweet.  Exiting..");
		return;
	}

	sendEmail(data['user']['screen_name'],data['text']);	
		
  var twt = data['text'];

		if (twt.match(/#DELETE/i))  {
//-------------------------------------------DELETE--------------------------------------------------
//--------------------------------------------------------------------------------------------------
    console.log("this is a DELETE tweet");
			
		//get #ID
		var recid="";
		
	  //look for ID tag or id tag
		if (twt.indexOf("#ID") > -1) {
			// if this is the last hashtag in the body, slice until the end of the body
			// had to split this because of 2nd parm in slice is -1, it was omitting last character in the string/tweet
			if (twt.indexOf("#",twt.indexOf("#ID")+1) == -1)
				recid = twt.slice(twt.indexOf("#ID")+3).trim();
			else
				recid = twt.slice(twt.indexOf("#ID")+3, twt.indexOf("#",twt.indexOf("#ID")+1)).trim();
		}
		
		if (twt.indexOf("#id") > -1) {
			if (twt.indexOf("#",twt.indexOf("#id")+1) == -1)
				recid = twt.slice(twt.indexOf("#id")+3).trim();
			else
				recid = twt.slice(twt.indexOf("#id")+3, twt.indexOf("#",twt.indexOf("#id")+1)).trim();
		}
			
		console.log("recid:" + recid);

		var screenName = data['user']['screen_name'] ;
	    console.log("screenName:" + screenName);
		
			Tweet.findById(mongoose.Types.ObjectId(recid), function (err, rec) { 
			   if(err) { 
						console.error("A tweet with that ID could not be found:" + recid);
					  twit.updateStatus('@' + data['user']['screen_name'] + ' A tweet with that ID could not be found:' + recid , data['id'] , callback);
						throw err; 
				 } else {
	 					//compare screenNames
					  if (rec.screenname !== screenName) {
							console.error("DELETE may only be issued by same screen name as original #ADD tweet");
							console.error("Orig:"+rec.twid+" and now:"+screenName);

					  	twit.updateStatus('@' + data['user']['screen_name'] + ' ' + recid + ' DELETE may only be issued by same screen name as original ADD tweet:' + screenName , data['id'] , callback);
						} else {
							
							Tweet.findByIdAndRemove(mongoose.Types.ObjectId(recid), function (err,rec){
    						if(err) { 
									console.error("ERROR while deleting record:" + recid);
					  			twit.updateStatus('@' + data['user']['screen_name'] + ' There was a problem deleting. Contact support with this ID:' + recid , data['id'] , callback);
									throw err; 
								} else {
									console.error("Tweet deleted successfully:" + recid);
									twit.updateStatus('@' + data['user']['screen_name'] + ' This event has been removed:' + recid , data['id'] , callback);
								}
							});
						}
				 }
			}); //end Tweet.findById
		  return;
			
		}// END DELETE BLOCK
		

//-------------------------------------------END DELETE--------------------------------------------------
//--------------------------------------------------------------------------------------------------

	if (twt.match(/#ADD/i))  {
//-------------------------------------------ADDRESS--------------------------------------------------
//--------------------------------------------------------------------------------------------------

    console.log("this is an address tweet");



var lat;
var lon;
var addr = "";
var pho = "";
var url = "";
var img = "";
	
//parse address, phone, url, image, if present
if (twt.indexOf("#ADD") > -1)
	addr = twt.slice(twt.indexOf("#ADD")+4, twt.indexOf("#",twt.indexOf("#ADD")+1)).trim();
if (twt.indexOf("#add") > -1)
	addr = twt.slice(twt.indexOf("#add")+4, twt.indexOf("#",twt.indexOf("#add")+1)).trim();

if (twt.indexOf("#PHO") > -1)
   pho = twt.slice(twt.indexOf("#PHO")+4, twt.indexOf("#",twt.indexOf("#PHO")+1)).trim();
if (twt.indexOf("#pho") > -1)
   pho = twt.slice(twt.indexOf("#pho")+4, twt.indexOf("#",twt.indexOf("#pho")+1)).trim();

if (twt.indexOf("#URL") > -1)
		url = twt.slice(twt.indexOf("#URL")+4, twt.indexOf("#",twt.indexOf("#URL")+1)).trim();
if (twt.indexOf("#url") > -1)
	  url = twt.slice(twt.indexOf("#url")+4, twt.indexOf("#",twt.indexOf("#url")+1)).trim();
	
if (twt.indexOf("#IMG") > -1)
		img = twt.slice(twt.indexOf("#IMG")+4, twt.indexOf("#",twt.indexOf("#IMG")+1)).trim();
if (twt.indexOf("#img") > -1)
	  img = twt.slice(twt.indexOf("#img")+4, twt.indexOf("#",twt.indexOf("#img")+1)).trim();

//google address
rest.get('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDTBmhy-vf1Cj9VxnmiZU_e6s_mVxo03UI&address='+addr).on('complete', function(result) {
  if (result instanceof Error) {
    console.log('Error:', result.message);
    this.retry(5000); // try again after 5 sec
  } else {
    console.log(result);
    console.log('city, state:');
    var citystate = result.results[0].address_components[3].long_name+', '+result.results[0].address_components[5].short_name;
    console.log(citystate);
    lat = result.results[0].geometry.location.lat;
    lon = result.results[0].geometry.location.lng;
    console.log('latlon:'+lat+','+lon);



//find nearest metro
Metro.aggregate([
   {
     $geoNear: {
        near: { type: "Point", coordinates: [ parseFloat(lon),parseFloat(lat) ] },
        distanceField: "distance",
        query: { active: true },
        distanceMultiplier:0.000621371,
        spherical: true
     }
   }
]).exec(function(err,docs){
    	       	if(!err) {
    	           	// add default if none

					console.log("METRO"+docs[0].distance+" "+docs[0].metro);

            if(docs[0].distance > 100) {

							// metro not covered yet
							console.log("Sorry, EventStack is not live in your city yet. ");
							twit.updateStatus('@' + data['user']['screen_name'] + ' ' + data['id'] + ' Sorry, eventstack is live in the US only now, and not in your city yet. Request it: add@eventstack.co.' , data['id'] , callback);
							return;

				    } else {

						  //set metro to closest metro area within 100 miles
						  var metro = docs[0].metro;
					    console.log("Yay, found your metro:" + metro);

						// Construct a new  address object
						var address1= {
						  'twid': data['user']['screen_name'],
						  'active': false,
						  'addresstext': data['text'],
						  'citystate': citystate,
						  'lat':lat,
						  'lng':lon,
						  'line1':addr,
						  'metro': metro,
						  'phone':pho,
						  'url':url,
						  'image':img
						};

						//insert address record or update existing
						Address.findOneAndUpdate(
							{'twid': data['user']['screen_name']}, address1, {upsert: true},
							  function(err, addresses) {
									if (err) {
							  		//onErr(err, callback);
										//need to log this error
										 console.error("ERROR: "+err);

									} else {
							  		console.log("Address inserted or updated");
							  		console.log(addresses);
							  		console.log("tweeting thanks. address has been saved");

							  //Update most recent tweet to active, citystate, and lat/lon
							  Tweet.findOneAndUpdate(
								  {'screenname': data['user']['screen_name']},{'active':true, 'place':citystate, 'metro':metro,'lat':lat, 'lon':lon, 'line1':addr, 'phone':pho, 'url':url, 'image':img},{ sort: { _id: -1 }},
									 function(err, tweetrec) {
									   if (err) {
										 //onErr(err, callback); 
											 //need to log this error
											 console.error("ERROR: "+err);

									   } else {
							  				//twit.updateStatus('@' + data['user']['screen_name'] + ' ' + data['id'] +  ' Thanks. Address has been saved.' , data['id'] , callback);
							  				twit.updateStatus('@' + data['user']['screen_name'] + ' ' + tweetrec._id +  ' Thanks. Address has been saved.' , data['id'] , callback);
											 
										 console.log("tweet updated to active:true with address");
									  }
								  });

							} // end if/else find update error
					  }); // end find and update


			} //end of aggregation else, within 100 miles
		       	} //end of if aggregate no error

	   			}); //end of aggregate metro




} // end of google not error
}); //end of successful google address

} else { //end if address
//-------------------------------------------END ADDRESS--------------------------------------------------

// this is an event post
//-------------------------------------------START EVENT--------------------------------------------------
console.log("NOT ADDRESS - an event");


//TODO: write eventday (2 digits)
//write eventmonth MAR
//write eventyear
//write metro...will need to figure this out
//...calc distance from each metro area...if less than 50, record as that metro;
//...if > 50, reply that this metro area is not listed yet
//...we'll contact you once it is added



    // make sure an eventdate can be found
   var eventdate="";
   var eventmonth="";
   var eventday="";
   var eventyear="2017";
   var month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

   //look for date in format 12/29
   var mmdd = data['text'].match(/(\d{1,2})\/(\d{1,2})/);
   if (mmdd!== null) {
      eventdate = new Date(mmdd[0]+"/"+eventyear);
		 	//make it noon
			eventdate.setHours(12,0,0,0);

   	  var mth = eventdate.getMonth();
      eventmonth=month[mth];
      ed=eventdate.getDate();
      eventday = (ed.toString().length == 1) ? '0'+ed.toString() : ed;

   //if not found, look for it spelled out Dec. 29
   } else  {
       var monthdd = data['text'].match(/\b(jan|jan.|january|feb|feb.|february|mar|mar.|march|apr|apr.|april|may|jun|june|jun.|jul|jul.|july|aug|aug.|august|sep|sep.|sept|sept.|september|oct|oct.|october|nov|nov.|november|dec|dec.|december)\s*\d{1,2}/i);
       if ((monthdd!== null) && (monthdd.toString().length > 2)) {
          eventdate = new Date(monthdd+" "+eventyear);
				 //make it noon
					eventdate.setHours(12,0,0,0);

          eventmonth=month[eventdate.getMonth()];
      	 // eventmonth=eventdate.getMonth();
      	  eventday=eventdate.getDate();
          ed=eventdate.getDate();
          eventday = (ed.toString().length == 1) ? '0'+ed.toString() : ed;
      }
	 }
	
   //if still no date, check if "Today" or "Tonight" is specified
	if (eventdate=="" && data['text'].match(/(today|tonight)/ig)) {
  		//set date as today
		  eventdate = new Date();
		 //make it noon
			eventdate.setHours(12,0,0,0);		
  		eventday = eventdate.getDate();
 		 	eventmonth = eventdate.getMonth(); //January is 0!
  		eventyear = eventdate.getFullYear();
	}

	//if still no date, check if tomorrow or tmrw is specified
	if (eventdate=="" && data['text'].match(/(tomorrow|tmrw)/ig)) {
  		//set date as tomorrow
		  eventdate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
		//make it noon
		eventdate.setHours(12,0,0,0);

  		eventday = eventdate.getDate();
 		 	eventmonth = eventdate.getMonth(); //January is 0!
  		eventyear = eventdate.getFullYear();
	}

	//if no date can be recognized on tweet, reply back, and return
	if (eventdate=="") {
		console.log("Missing date on tweet: "+JSON.stringify(tweet));
   		twit.updateStatus('@' + data['user']['screen_name'] + ' ' + data['id'] + ' We can\'t figure out when your event is.  Please include a date (YY/MM) and tweet again.' , data['id'] , callback);
		return;
	}

	
    //parse hashtags to get tags/categories
    var regexp = /[#]+[A-Za-z0-9-_]+/gi;
    var matches_array = data['text'].match(regexp);


	//remove hashtags before saving
	for (var i=0; i < matches_array.length; i++) {
	 matches_array[i] = matches_array[i].replace('#', '');
	}

	var imgbase = '';

	if (matches_array.indexOf("kids") > -1) {
	    imgbase = "images/kids/"
	} else if (matches_array.indexOf("music") > -1) {
	    imgbase = "images/music/"
	} else if (matches_array.indexOf("bars") > -1) {
	    imgbase = "images/cafe/"
	} else {
	    imgbase = "images/misc/"
	}

    // to ramdomize image, get length
    var tweetlength=data['text'].length;
    var imgpos=tweetlength%20;
    var evimg=imgbase+imgpos+".jpg";

    // Construct a new tweet object
    var tweet = {
      twid: data['id'],
      active: false,
      author: data['user']['name'],
      avatar: data['user']['profile_image_url'],
      body: data['text'],
      createddate: new Date(), //data['created_at'],
      screenname: data['user']['screen_name'],
      place: '',
      eventdate: eventdate,
      eventday: eventday,
      eventmonth: eventmonth,
      eventyear: eventyear,
      tags: matches_array,
      eventimage: evimg,
      likes: 0
    };




//now check for address
Address.find({
    'twid': data['user']['screen_name']
  }, function(err, addresses) {
    if (err) {
      //onErr(err, callback);
			//need to log this error.
			console.error("ERROR: "+err);
			
    } else {

	  // check to see if this twitter user has address saved on file
      	if (addresses.length == 0) {
        	console.log("No address, tweeting request for address");
        	twit.updateStatus('@' + data['user']['screen_name'] + ' ' + data['id'] + ' Almost there.. just tweet the event address and include #ADD and #EVSTK' , data['id'] , callback);

			//adding default point so mongo index doesn't error
      		tweet.loc={ "type" : "Point", "coordinates" : [41.8781136, -87.6297982]};

        	// Save tweet to the database, but inactive, waiting on place
        	var tweetEntry = new Tweet(tweet);
        	tweetEntry.save(function(err) {
        	if (!err) {
          		// If everything is cool, socket.io emits the tweet.
          		console.log("Event without address saved to db"+JSON.stringify(tweet));
          		io.emit('tweet', tweet);
        	}
        	});

	 	// address is found, update tweet with address data and save
      	} else {

      		console.log("looking good...");
      		console.log(addresses);
      		//return;

      		//set active
      		console.log("setting to active");
      		tweet.active=true;
      		console.log("setting address on tweet from address record");
      		tweet.place=addresses[0].citystate;
      		tweet.lat=addresses[0].lat;
      		tweet.lon=addresses[0].lng;
      		tweet.loc={ "type" : "Point", "coordinates" : [addresses[0].lng, addresses[0].lat]};
			tweet.eventurl=addresses[0].url;
			tweet.eventurldefault=addresses[0].url;
			tweet.eventimage=addresses[0].img;
 			tweet.phone=addresses[0].phone;
 			tweet.street=addresses[0].line1;
 			tweet.metro=addresses[0].metro;

      		var tweetEntry = new Tweet(tweet);

		  	// Save 'er to the database
		  	tweetEntry.save(function(err, tweetrec) {
		  	if (!err) {
					// If everything is cool, socket.io emits the tweet.
					console.log("Event saved to db"+JSON.stringify(tweet));
        	twit.updateStatus('@' + data['user']['screen_name'] + ' ' + tweetrec._id + ' Thanks for posting to EventStack. We have your address. Your event is listed!' , data['id'] , callback);
					io.emit('tweet', tweet);
      		console.log("total success");
		  	} else {
		        console.log("Error saving to db"+err.data+" payload"+JSON.stringify(tweet));
 			}
    		});

    	} //end if/else address found
   	} // end if/else address find had no errr
  }); // end Address.find


 } //end if not #address

});

};
