var Todo = require('./models/todo');
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
console.log("new date:"+compareDate);

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
	       		Tweet.find({  'eventdate': {$gte: compareDate} },'twid active author avatar body date screenname place eventdate tags eventimage eventday eventmonth eventyear eventurl homeurl title lat lon',{skip: start, limit: 100}).sort({createdate: -1}).exec(function(err,docs){
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
	       		Tweet.findOne({ '_id':req.params.id },'twid active author avatar body date screenname place eventdate tags eventimage eventday eventmonth eventyear eventurl homeurl title').exec(function(err,docs){
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

        // get events, with filter and without--------------------------------------
	app.get('/api/events/:chosenCity/:chosenDay/:chosenFilter/:page', function(req, res) {

         	var compareDate=getDate(req.params.chosenDay);
         	var endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000);
  			if (req.params.chosenDay == "Weekend") {
         	    endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000 * 3);
			}
			console.log("Start, end:"+compareDate+","+endDate);

			var start = (req.params.page * 10);

			// filter not specified, so don't include in query
			if (req.params.chosenFilter == 'Filters') {
	       		Tweet.find({ 'place' :  {$regex : ".*" + req.params.chosenCity + ".*", $options : "i"}, 'active':true, 'eventdate': {$gte: compareDate, $lt: endDate} },'twid active author avatar body date screenname place eventdate tags eventimage eventday eventmonth eventyear eventurl homeurl title',{skip: start, limit: 10}).sort({eventdate: 1}).exec(function(err,docs){
	           	if(!err) {
	               	// add default if none
	              	if (docs == '') {
			  			console.log("docs null");
			  			docs = ["none"];
		       		}
		       	}

    			res.json(docs);
	   		});

			// filter was specified, so add to query
			} else {
    	   		Tweet.find({ 'place' :  {$regex : ".*" + req.params.chosenCity + ".*", $options : "i"}, 'active':true, 'tags': req.params.chosenFilter, 'eventdate': {$gte: compareDate, $lt: endDate} },'twid active author avatar body date screenname place eventdate tags eventimage eventday eventmonth eventyear eventurl homeurl title',{skip: start, limit: 10}).sort({eventdate: 1}).exec(function(err,docs){
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
	app.get('/api/cities/:chosenDay', function(req, res) {

           var compareDate=getDate(req.params.chosenDay);
         	var endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000);
  			if (req.params.chosenDay == "Weekend")
         	    endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000 * 3);

           Tweet.distinct( 'place', {'eventdate': {$gte: compareDate, $lt: endDate}} ).exec(function(err,docs){
           if(!err) {
               	// add default if none
               if (docs == '') {
		  			console.log("docs null");
		  			docs = ["none"];
	       }}
                docs.sort();
                chi = docs.indexOf("Chicago, IL");
                docs.splice(chi,1);
                docs.unshift("Chicago, IL");
                res.json(docs);
	   });
	});



	// get all filters for day range ---------------------------------------------------------------------
	app.get('/api/filters/:chosenCity/:chosenDay', function(req, res) {

    	var compareDate=getDate(req.params.chosenDay);
        var endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000);
  		if (req.params.chosenDay == "Weekend") {
           endDate = new Date(new Date(compareDate).getTime() + 24 * 60 * 60 * 1000 * 3);
		}
//Tweet.distinct( 'tags', { 'place': req.params.chosenCity, 'eventdate': {$gte: compareDate}, tags: {$in: ['kids','music'] }  } ).exec(function(err,docs){
  		Tweet.distinct( 'tags', { 'place': req.params.chosenCity, 'eventdate': {$gte: compareDate, $lt: endDate} } ).exec(function(err,docs){
    	if(!err) {

      		// add default if none
      		if (docs == '') {
		  		console.log("filters null");
		  		docs = ["none"];
		  	}
		}
                var filtered = docs.filter(isTagApproved);

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
	//evt.eventdate = req.body.eventdate;
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


	// delete an event
	app.delete('/api/events/:id', function(req, res) {
		Tweet.remove({
			_id : req.params.id
		}, function(err, evt) {
			if (err)
				res.send(err);

		//	getTodos(res);
		});
	});


	// application -------------------------------------------------------------
	app.get('/about', function(req, res) {
		res.sendfile('./public/about.html'); // ont-end)
	});
	app.get('/contact', function(req, res) {
		res.sendfile('./public/contact.html'); // nd)
	});
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

	// run preload -------------------------------------------------------------
	app.get('/admin/load', isLoggedIn, function(req, res) {
          //req.session.redirect_to = '/about';

          //do db lookup to find max date where soure = scrape
          var tempdate = '2015-11-30';
          var tdate = new Date(tempdate);

          var eventmonth = tdate.getMonth();
          var eday = tdate.getDate();
          var eventyear = tdate.getFullYear();
          var eventday = (eday.toString().length == 1) ? '0'+eday.toString() : eday;
          var tgtdate = eventyear + '-' + eventmonth + '-' + eventday;

          var url='http://chicago.metromix.com/browse/kids-and-family/dates:'+tgtdate+'-to-'+tgtdate;

          var title, release, rating, lat, lon, desc, place;
          var json = { title : "", release : "", rating : ""};
	 	  var rslts  = []; //will store all Tweet objects to print to screen
	 	  var testlimit = 3;
	 	  var testcount = 0;

          request(url, function(error, response, html){
            if(!error){
              var $ = cheerio.load(html);

    	      $('article').each(function(i, element){
				//for testing
				if (testcount > testlimit)
					return false;


                var data = $(this);
                title = data.children().children().children().children().first().text();
                lat =   data.children().children().children().children().first().attr('data-lat');
                lon =   data.children().children().children().children().first().attr('data-lon');
				desc =  data.find('p').first().text().trim();
				place=  data.find('.content-article').children().children().eq(0).children().children().text();

		  		var gurl='https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDTBmhy-vf1Cj9VxnmiZU_e6s_mVxo03UI&latlng='+lat+','+lon;
				console.log('URL: '+gurl);

				//get address from google geocache, sleeping 2 secs btwn

					rest.get(gurl).on('complete', function(result) {
 				 	if (result instanceof Error) {
    					console.log('Error:', result.message);
    					//this.retry(5000); // try again after 5 sec
  					} else {
    					//console.log(result);
    					console.log('city, state:');
    					var citystate = result.results[0].address_components[3].long_name+', '+result.results[0].address_components[5].short_name;
    					console.log(citystate);
					}
					});

			sleep.sleep(1);

              var evt = new Tweet();
                evt.author = 'daily';
                evt.body = title + ' ' + place + ' ' + desc;
                evt.tags = ['kids'];
                evt.place = '';
                evt.lat = lat;
                evt.lon = lon;
                evt.source = 'scrape'
                evt.active = 'needsreview';
                evt.screenname = 'daily';
                evt.eventurl = '';
                evt.homeurl = '';
                evt.eventday = eventday;
   	 			evt.eventmonth = eventmonth;
    	        evt.eventyear = eventyear;
    	        evt.eventdate = tdate;
    	        evt.createdate = new Date();

                //save to db
                //evt.save(function(err) {
                //  if (err)
                //    res.send(err);

                //});

                //add to array to return
                rslts.push(evt);
            })

 		//console.log("TOTAL: "+rslts.length + " RESULTS:"+rslts);
               res.json({ total: rslts.length, results: rslts });
         }
    })

	});
	app.get('/admin*', isLoggedIn, function(req, res) {
	   res.sendfile('./public/admin.html'); //
	});

	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); //
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

