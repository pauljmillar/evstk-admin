var Tweet = require('./models/Tweet');
var rest = require('../node_modules/restler');
var  nodemailer = require('nodemailer');
var request = require('request');
var cheerio = require('cheerio');
var sleep = require('sleep');

 
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

// if user is authenticated in the session, carry on
   if (req.isAuthenticated())
      return next();

// if they aren't redirect them to the home page
   res.redirect('/login');
}


function getDate(chosenDay) {
var compareDate, dd, mm, yyyy;
  var today = new Date();
  dd = today.getDate();
  mm = today.getMonth(); //January is 0!
  yyyy = today.getFullYear();
  todayDate=new Date(yyyy,mm,dd);

switch(chosenDay){
 case "Today":
 console.log("today case");
  compareDate=todayDate;
  break;
 case "Tomorrow":
 console.log("tomorrow case");
   var tomorrowDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  dd = tomorrowDate.getDate();
  mm = tomorrowDate.getMonth(); //January is 0!
  yyyy = tomorrowDate.getFullYear();
  compareDate=new Date(yyyy,mm,dd);
  break;
 case "Weekend":
  console.log("weekend case");
  var today = new Date();
  var todayDay = today.getDay();
  switch(todayDay){
   case 5:
   case 6:
   case 0:
    compareDate=todayDate;
    break;
   default:
   var numD=5-todayDay;
   var wkndDate = new Date(new Date().getTime() + numD*(24 * 60 * 60 * 1000));
   dd = wkndDate.getDate();
   mm = wkndDate.getMonth(); //January is 0!
   yyyy = wkndDate.getFullYear();
   compareDate=new Date(yyyy,mm,dd);
  }
  break;
 default:
console.log("default case");
  compareDate=new Date(yyyy,mm,dd);
 }

console.log("TODAY: "+yyyy+' '+mm+' '+dd);
console.log("chosenDay: "+chosenDay);
//console.log("new date:"+compareDate);

return compareDate;
};

//list of approved tags/filters
function isTagApproved(value) {
 if([
  'kids'
, 'music'
, 'family'
, 'free'
, 'outside'
, 'art'
, 'fitness'
, 'theater'
, 'theater '
, 'bars '
, 'bars'
, 'none'
].indexOf(value) !== -1)
   return true;
 else
   return false;
}


module.exports = function(app, passport) {

	// api ======================================================================
	// get all events for debugging-----------------------------------------------
	app.get('/api/events', function(req, res) {

			var start = (req.params.page * 10);
         	        var compareDate=getDate('Today');
//getting inactive too	       		Tweet.find({ 'active':true, 'eventdate': {$gte: compareDate} },'twid active author avatar body date screenname place eventdate tags eventimage',{skip: start, limit: 10}).sort({eventdate: 1}).exec(function(err,docs){
	       		Tweet.find({  'eventdate': {$gte: compareDate} },'twid active author avatar body date screenname place eventdate tags eventimage eventday eventmonth eventyear eventurl homeurl title lat lon imageurl imageurldefault likes createdate',{skip: start, limit: 200}).sort({_id: -1}).exec(function(err,docs){
	           	if(!err) {
	               	  // add default if none
	              	  if (docs == '') {
			  	console.log("docs null");
			  	docs = ["none"];
		       	  }
		       	}

    			res.json(docs);
	   		});
	});

	// get specific event for admin: edit or delete----------------------------------------=
	app.get('/api/events/:id', function(req, res) {

			//var start = (req.params.page * 10);
         	        var compareDate=getDate('Today');
	       		Tweet.findOne({ '_id':req.params.id },'twid active author avatar body date screenname place eventdate tags eventimage eventday eventmonth eventyear eventurl homeurl title lat lon imageurl imageurldefault likes').exec(function(err,docs){
	           	if(!err) {
	               	  // add default if none
	              	  if (docs.length == 0) {
			  	console.log("docs null");
			  	//docs = new Tweet();
                                docs ={message: 'none'};
		       	  }
		       	} else {
                                //docs ={message: 'error'+err};
                                docs = new Tweet();
                        }
    			res.json(docs);
	   		});
	});

	// get specific event geo ----------------------------------------=
	app.get('/api/events/loc/:chosenCity', function(req, res) {

			//var start = (req.params.page * 10);
         	        var compareDate=getDate('Today');
	       		Tweet.findOne({ place: req.params.chosenCity }).exec(function(err,docs){
	           	if(!err) {
	               	  // add default if none
	              	  if (docs.length == 0) {
			  			console.log("No documents found for that city?");
                                //docs ={message: 'none'};
		       	  	  }
		       	} else {
                                docs ={message: 'error'+err};
                                //docs = new Tweet();
                        }
    			res.json(docs);
	   		});
	});
	
        // get events, with filter and without--------------------------------------
//	app.get('/api/events/:chosenCity/:chosenDay/:chosenFilter/:page', function(req, res) {
	app.get('/api/events/:chosenMetro/:latlon/:chosenDay/:chosenFilter/:page', function(req, res) {

         	var compareDate=getDate(req.params.chosenDay);
         	var endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000);
  			if (req.params.chosenDay == "Weekend") {
         	    endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000 * 3);
			}
			//console.log("Start, end:"+compareDate+","+endDate);

			var perpage = 20;
			//var start = (req.params.page * perpage);
			var tot = (req.params.page * perpage + perpage);
			var skp = (req.params.page * perpage);

			var lon = req.params.latlon.split(',')[0];
			var lat = req.params.latlon.split(',')[1];

			// filter not specified, so don't include in query
			if (req.params.chosenFilter == 'Filters') {
	       		//Tweet.find({ 'place' :  {$regex : ".*" + req.params.chosenCity + ".*", $options : "i"}, 'active':true, 'eventdate': {$gte: compareDate, $lt: endDate} },'twid active author avatar body date screenname place eventdate tags eventimage eventday eventmonth eventyear eventurl homeurl title',{skip: start, limit: 10}).sort({eventdate: 1}).exec(function(err,docs){
	       		console.log("coords"+req.params.latlon);
	       		//Tweet.find( { loc: { $near : { $geometry: { type: "Point",  coordinates: [ parseFloat(lon),parseFloat(lat) ] } } }, metro: "Chicago, IL", eventdate: {$gte: compareDate, $lt: endDate} } ).limit(perpage).skip(start).exec(function(err,docs){
		        //testing - hardcoded loc
		        //Tweet.find( { loc: { $near : { $geometry: { type: "Point",  coordinates: [ -87.635878,41.878885 ] } } }, metro: "Chicago, IL" } ).exec(function(err,docs){

Tweet.aggregate([
   {
     $geoNear: {
        near: { type: "Point", coordinates: [ parseFloat(lon),parseFloat(lat) ] },
        distanceField: "distance",
        query: { metro: req.params.chosenMetro, eventdate: {$gte: compareDate, $lt: endDate}},
        num: tot,
        distanceMultiplier:0.000621371,
        spherical: true
     }
   }, { $skip:skp
   }
]).exec(function(err,docs){


                	if(!err) {
	               	// add default if none
console.log("dist "+docs.distance);
	              	if (docs == '') {
			  			console.log("docs null");
			  			docs = ["none"];
		       		}
		       	}

    			res.json(docs);
	   		});

			// filter was specified, so add to query
			} else {
    	   		//Tweet.find({ 'place' :  {$regex : ".*" + req.params.chosenCity + ".*", $options : "i"}, 'active':true, 'tags': req.params.chosenFilter, 'eventdate': {$gte: compareDate, $lt: endDate} },'twid active author avatar body date screenname place eventdate tags eventimage eventday eventmonth eventyear eventurl homeurl title',{skip: start, limit: 10}).sort({eventdate: 1}).exec(function(err,docs){
//	       		Tweet.find( { loc: { $near : { $geometry: { type: "Point",  coordinates: [ parseFloat(lon),parseFloat(lat) ] } } }, metro: "Chicago, IL", eventdate: {$gte: compareDate, $lt: endDate},'tags': req.params.chosenFilter } ).limit(perpage).skip(start).exec(function(err,docs){
Tweet.aggregate([
   {
     $geoNear: {
        near: { type: "Point", coordinates: [ parseFloat(lon),parseFloat(lat) ] },
        distanceField: "distance",
        query: { metro: req.params.chosenMetro, eventdate: {$gte: compareDate, $lt: endDate}, tags: req.params.chosenFilter},
        num: tot,
        distanceMultiplier:0.000621371,
        spherical: true
     }
   }, { $skip:skp
   }
]).exec(function(err,docs){
    	       	if(!err) {
    	           	// add default if none
    	          	if (docs == '') {
			  			console.log("docs null");
			  			docs = ["none"];
		       		}
		       	}

		       	res.json(docs);
	   			});
			}
	});



	// get all cities from dropdown for date range--------------------------------------------------
	app.get('/api/cities/:chosenDay/:chosenMetro', function(req, res) {

           var compareDate=getDate(req.params.chosenDay);
         	var endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000);
  			if (req.params.chosenDay == "Weekend")
         	    endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000 * 3);

           Tweet.distinct( 'place', {'eventdate': {$gte: compareDate, $lt: endDate}, metro: req.params.chosenMetro} ).exec(function(err,docs){
           if(!err) {
               	// add default if none
               if (docs == '') {
		  			console.log("docs null");
		  			docs = ["none"];
	       }}
                docs.sort();
                chi = docs.indexOf(req.params.chosenMetro);
                docs.splice(chi,1);
                docs.unshift(req.params.chosenMetro);
                res.json(docs);
	   });
	});

	// get all metros for dropdown --------------------------------------------------
	app.get('/api/metros/:chosenDay', function(req, res) {

           var compareDate=getDate(req.params.chosenDay);
         	var endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000);
  			if (req.params.chosenDay == "Weekend")
         	    endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000 * 3);

           Tweet.distinct( 'metro', {'eventdate': {$gte: compareDate, $lt: endDate}} ).exec(function(err,docs){
           if(!err) {
               	// add default if none
               if (docs == '') {
		  			console.log("docs null");
		  			docs = ["none"];
	       }}
                //docs.sort();
                //chi = docs.indexOf(req.params.chosenMetro);
                //docs.splice(chi,1);
                //docs.unshift(req.params.chosenMetro);
                res.json(docs);
	   });
	});

	// get all filters for day range ---------------------------------------------------------------------
	// NEED TO UPDATE THIS TO WORK WITH GEOLOCATION

	app.get('/api/filters/:chosenDay/:chosenMetro', function(req, res) {

    	var compareDate=getDate(req.params.chosenDay);
        var endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000);
  		if (req.params.chosenDay == "Weekend") {
           endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000 * 3);
		}
//Tweet.distinct( 'tags', { 'place': req.params.chosenCity, 'eventdate': {$gte: compareDate}, tags: {$in: ['kids','music'] }  } ).exec(function(err,docs){
  	//	Tweet.distinct( 'tags', { 'place': req.params.chosenCity, 'eventdate': {$gte: compareDate, $lt: endDate} } ).exec(function(err,docs){
   		Tweet.distinct( 'tags', { 'metro': req.params.chosenMetro, 'eventdate': {$gte: compareDate, $lt: endDate} } ).exec(function(err,docs){
   	if(!err) {

      		// add default if none
      		if (docs == '') {
		  		console.log("filters null");
		  		docs = ["none"];
		  	}
		}
                var filtered = docs.filter(isTagApproved);
//var filtered=docs
		res.json(filtered);
		//res.json(docs);
	   });
	});

	// create event
	app.post('/api/events', function(req, res) {


	var evt = new Tweet();
	evt.author = 'daily';
	evt.body = req.body.body;
	evt.place = req.body.place;
	evt.tags = req.body.tags;
	evt.active = req.body.active;
	evt.screenname = req.body.screenname;
	evt.eventurl = req.body.eventurl;
	evt.homeurl = req.body.homeurl;
	evt.createdate = new Date();
    evt.eventday = (req.body.eventday.toString().length == 1) ? '0'+req.body.eventday.toString() : req.body.eventday;
    evt.eventmonth = req.body.eventmonth;
    evt.eventyear = req.body.eventyear;
    evt.eventdate = new Date(req.body.eventyear+"-"+req.body.eventmonth+"-"+req.body.eventday);

    evt.save(function(err) {
            if (err)
                res.send(err);

            //res.json({ message: 'Event created!' });
        });

	});

        // update event
        app.put('/api/events/:id', function(req, res) {
          Tweet.findById(req.params.id, function(err, evt) {

            if (err)
                res.send(err);

            evt.author = req.body.author;
            evt.body = req.body.body;
            evt.tags = req.body.tags;
            evt.place = req.body.place;
            evt.active = req.body.active;
            //evt.eventdate = req.body.eventdate;
            evt.screenname = req.body.screenname;
            evt.eventurl = req.body.eventurl;
            evt.homeurl = req.body.homeurl;
            evt.eventday = (req.body.eventday.toString().length == 1) ? '0'+req.body.eventday.toString() : req.body.eventday;
   	    evt.eventmonth = req.body.eventmonth;
    	    evt.eventyear = req.body.eventyear;
    	    evt.eventdate = new Date(req.body.eventyear+"-"+req.body.eventmonth+"-"+req.body.eventday);

            evt.save(function(err) {
             if (err)
                res.send(err);

            res.json({ message: 'Event created!' });
           });
         });

        });

        // update event
        app.put('/api/events/like/:id', function(req, res) {
          Tweet.findById(req.params.id, 'likes', function(err, evt) {

            if (err)
                res.send(err);

            evt.likes = evt.likes || 0; //evt.likes++;
            evt.likes = evt.likes + 1;

            evt.save(function(err) {
             if (err)
                res.send(err);

            res.json({ message: 'Event created!' });
           });
         });

        });

	// delete an event
	app.delete('/api/events/:id', function(req, res) {
		Tweet.remove({
			_id : req.params.id
		}, function(err, evt) {
			if (err)
				res.send(err);

		});
	});

	//app.get('/api/metro', function(req, res) {
        //    res.send( res.locals.metro );
	//});

	// application -------------------------------------------------------------

	app.get('/login', function(req, res) {
		res.sendfile('./public/login.html', { message: req.flash('loginMessage') }); // nd)
	});
        app.post('/login', passport.authenticate('local-login', {
          successRedirect : '/admin/', // redirect to the secure profile section
          failureRedirect : '/login', // redirect back to the signup page if there is an error
          failureFlash : true // allow flash messages
        }));
//        app.get('/signup', function(req, res) {
//		res.sendfile('./public/signup.html', { message: req.flash('signupMessage') }); // nd)
//	});
//        app.post('/signup', passport.authenticate('local-signup', {
//          successRedirect : '/profile', // redirect to the secure profile section
//          failureRedirect : '/signup', // redirect back to the signup page if there is an error
//          failureFlash : true // allow flash messages
//        }));
        app.get('/logout', function(req, res) {
		req.logout();
                res.redirect('/');
	});

	app.get('/admin*', isLoggedIn, function(req, res) {
	   res.sendfile('./public/admin.html'); //
	});


	app.get('*', isLoggedIn, function(req, res) {
	   res.sendfile('./public/admin.html'); //
	});

        app.post('/contact', function (req, res) {
          var mailOpts, smtpTrans;
          smtpTrans = nodemailer.createTransport('SMTP', {
          service: 'Gmail',
            auth: {
              user: "paul.millar@gmail.com",
              pass: "ventura123"
            }
          });
          mailOpts = {
            from: req.body.firstname + ' &lt;' + req.body.email + '&gt;', //grab form data from equest body object
            to: 'paul.millar@gmail.com',
            subject: 'Website contact form',
            text: req.body.message
          };
         smtpTrans.sendMail(mailOpts, function (error, response) {
           if (error) {
               //     res.render('contact', { title: 'Raging Flame Laboratory - Contact', msg: 'Error occured, message not sent.', err: true, page: 'contact' })
               //res.sendFile(express.static(__dirname+"/public/contact.html"));
               console.log("error"+error);
	       res.sendfile('./public/contact.html'); // nd)

           } else {
              //res.render('contact', { title: 'Raging Flame Laboratory - Contact', msg: 'Message sent! Thank you.', err: false, page: 'contact' })
              console.log("success");
	      res.sendfile('./public/contact.html'); // nd)
           }
        });
      });

};

