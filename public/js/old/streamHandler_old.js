var Tweet = require('../../app/models/Tweet');
var Address = require('../../app/models/Address');
var rest = require('../../node_modules/restler');


var callback = function handleError(error) {
   if (error) {
   console.error('Custom response status:', error.statusCode);
   console.error('Custom data:', error.data);
  }
};

module.exports = function(stream, io,twit){

  // When tweets get sent our way ...
  stream.on('data', function(data) {

    //Need to add:
    //capture location and store, if it is set in the tweet
    //OR parse string for zip...5 numbers
    //

// if tweet contains #address, dont try to write event;
//   write address, then look to update any events with address in future
//   if valid address, tweet thank you
//
// if tweet contains #update and id, update event
//
//// query address table using username
// if found, add location to event
// save event to db
// if not found, tweet request for address
// still save event, missing location

  console.log("***logging tweet: "+data['user']['name']+" tweet:"+data['text']);

  //if (data['user']['screen_name'] == 'locallib'){

if (data['text'].match(/#address/))  {

    console.log("this is an address tweet");

    //1. does address already exist for twid
    // yes, replace, tweet that it has been replaced
    // no, update, tweet that it has been added...also need to update any pending events to 'active'
    // if #address #delete - testing only - will remove address recordkkjj


    //look to see if this is a delete
    if (data['text'].match(/#delete/))  {
       console.log("deleting address...");

		Address.findOneAndRemove({
			'twid': data['user']['screen_name']
		  }, function(err, addresses) {
			if (err) {
			  onErr(err, callback);
			} else {
			  console.log("Record deleted...");
			  console.log(addresses);
			  //if (addresses.length > 0) {
			  //  twit.updateStatus('@' + data['user']['screen_name'] + ' Address has been deleted' , data['id'] , callback);
			  //}
			  return;

			  callback("", addresses);
			}
		}); // end findANdremove

    	} else { // end if #delete

//need to strip hashtags from user text
//then call google geocode
//save city,state as place on update

// remove #address
var addr = data['text'];
addr = addr.replace('#address', '');
addr = addr.replace('#Address', '');
addr = addr.replace('#ADDRESS', '');
addr = addr.replace('#bigday', '');
addr = addr.replace('#thingstodo1', '');

var lat;
var lng;



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
    lng = result.results[0].geometry.location.lng;
    console.log('latlng:'+lat+','+lng);

//
    // Construct a new  address object
    var address1= {
      'twid': data['user']['screen_name'],
      'active': false,
      'addresstext': data['text'],
      'citystate': citystate,
      'lat':lat,
      'lng':lng
    };

//insert address record or update existing
Address.findOneAndUpdate(
    {'twid': data['user']['screen_name']}, address1, {upsert: true},
      function(err, addresses) {
    if (err) {
      onErr(err, callback);
    } else {
      console.log("Address inserted or updated");
      console.log(addresses);
      console.log("tweeting thanks. address has been saved");
      twit.updateStatus('@' + data['user']['screen_name'] + ' Thanks. Address has been saved.' , data['id'] , callback);

     //     "lat" => lat,
     //     "lon" => lng,
     //     "loc" => { "type" => "Point", "coordinates" => [lng.to_f, lat.to_f]},

      //need to update any event tweet records to status: true, and city
      //Tweet.update(
      Tweet.findOneAndUpdate(
      {'screenname': data['user']['screen_name']},{'active':true, 'place':citystate, 'lat':lat, 'lng':lng},{ sort: { name: -1 }},
         function(err, addresses) {
           if (err) {
             onErr(err, callback);
           } else {
             console.log("tweet updated to active:true with address");
          }
        });

    }
  }); // end find and update

}
}); //end of successful google address

    // Construct a new  address object
   // var address= {
   //   twid: data['user']['screen_name'],
   //   active: false,
   //   address1: data['user']['text']
   // };


    //var addressEntry = new Address(address);

    // Save 'er to the database
    //addressEntry.save(function(err) {
    //  if (!err) {
    //    console.log("address saved");
    //  }
    //});

   //twit.updateStatus(data['id'] + ' @' + data['user']['screen_name'] + ' Thanks for posting to daily' , data['id'] , callback);
}//end if/else delete
} else { //end if address

// this is an event post
//
console.log("NOT ADDRESS - an event");


    // make sure an eventdate can be found
   var eventdate="";
   var eventmonth="";
   var eventday="";
   var eventyear="2016";
   var month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

   var mmdd = data['text'].match(/(\d{1,2})\/(\d{1,2})/);
   if (mmdd!== null) {
      eventdate = new Date(mmdd[0]+"/"+eventyear);
   var mth = eventdate.getMonth();
      eventmonth=month[mth];
      ed=eventdate.getDate();
      eventday = (ed.toString().length == 1) ? '0'+ed.toString() : ed;
   } else {

       var monthdd = data['text'].match(/\b(jan|jan.|january|feb|feb.|february|mar|mar.|march|apr|apr.|april|may|jun|june|jun.|jul|jul.|july|aug|aug.|august|sep|sep.|sept|sept.|september|oct|oct.|october|nov|nov.|november|dec|dec.|december)\s*\d{1,2}/i);
       if ((monthdd!== null) && (monthdd.toString().length > 2)) {
          eventdate = new Date(monthdd+" "+eventyear);
          eventmonth=month[eventdate.getMonth()];
      	 // eventmonth=eventdate.getMonth();
      	  eventday=eventdate.getDate();
          ed=eventdate.getDate();
          eventday = (ed.toString().length == 1) ? '0'+ed.toString() : ed;
      }
    }


//// make sure location exists
//if (data['place'] == null) {
//      console.log("Missing place on tweet: "+data['user']['name']+" tweet:"+data['text']);
//} else {

    // to ramdomize image, get length
    var tweetlength=data['text'].length;
    var imgpos=tweetlength%10;
    var evimg="http://lorempixel.com/600/125/people/"+imgpos;

    //parse hashtags
    var regexp = /[#]+[A-Za-z0-9-_]+/gi;
    var matches_array = data['text'].match(regexp);


//remove hashtags before saving
for (var i=0; i < matches_array.length; i++) {
 matches_array[i] = matches_array[i].replace('#', '');
}

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
      tags: matches_array,
      eventimage: evimg
    };


if (eventdate!=="") {    // Create a new model instance with our object


//now check for address
Address.find({
    'twid': data['user']['screen_name']
  }, function(err, addresses) {
    if (err) {
      onErr(err, callback);
    } else {
      console.log("is address found?");
      if (addresses.length == 0) {
        console.log("No address, tweeting request for address");
        twit.updateStatus(data['id']+' @' + data['user']['screen_name'] + ' Thanks for posting to daily. Please tweet the event address using #address' , data['id'] , callback);

		//adding default point so mongo index doesn't error
      	tweet.loc={ "type" : "Point", "coordinates" : [41.8781136, -87.6297982]};

        var tweetEntry = new Tweet(tweet);

        //NOTE - we need a default location here, or geospatial index will not allow null insert
        // Save 'er to the database
        tweetEntry.save(function(err) {
        if (!err) {
          // If everything is cool, socket.io emits the tweet.
          console.log("Event without address saved to db"+JSON.stringify(tweet));
          io.emit('tweet', tweet);
        }
        });

      } else {

        twit.updateStatus(data['id']+' @' + data['user']['screen_name'] + ' Thanks for posting to daily. We have your address. Your event is listed!' , data['id'] , callback);
      console.log("total success");
      console.log(addresses);
      //return;

      //set active
      console.log("setting to active");
      tweet.active=true;
      console.log("setting address on tweet from address record");
      tweet.place=addresses[0].citystate;
      tweet.lat=addresses[0].lat;
      tweet.lng=addresses[0].lng;
      tweet.loc={ "type" : "Point", "coordinates" : [addresses[0].lng, addresses[0].lat]};

      var tweetEntry = new Tweet(tweet);

      // Save 'er to the database
      tweetEntry.save(function(err) {
      if (!err) {
        // If everything is cool, socket.io emits the tweet.
        console.log("Event saved to db"+JSON.stringify(tweet));
        io.emit('tweet', tweet);
      } else {
		        console.log("Error saving to db"+err.data+" payload"+JSON.stringify(tweet));

 	}
    });

    }
   }
  }); // end Team.find



} else {
console.log("Missing date on tweet: "+JSON.stringify(tweet));
   twit.updateStatus(data['id'] + ' @' + data['user']['screen_name'] + ' Thanks from daily.  Please include a date (YY/MM) and retweet.' , data['id'] , callback);
}


 } //end if not #address
//} //if locallib

});

};
