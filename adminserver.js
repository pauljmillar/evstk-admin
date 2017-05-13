// set up ======================================================================
var express  = require('express');
var http     = require('http');
var app      = express();               		// create our app w/ express
var mongoose = require('mongoose'); 			// mongoose for mongodb
var port     = process.env.PORT || 35728;		// set the port
var config   = require('./config.js'); 			// load the database config
var twitter  = require('ntwitter');                      //twitter listener
var streamHandler = require('./public/js/streamHandler');   //listen
var morgan   = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var flash = require('connect-flash');


// configuration ===============================================================
mongoose.connect(config.dburl); 	// connect to mongoDB database on modulus.io

require('./public/js/passport')(passport); // pass passport for configuration

app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
app.use(cookieParser());
//required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport);

// listen (start app with node server.js) ======================================
//app.listen(port);
var server = http.createServer(app).listen(port, function() {
  console.log('Express server listening on port ' + port);
});

//##########################################
// Create a new ntwitter instance
var twit = new twitter(config.twitter);

// Initialize socket.io
var io = require('socket.io').listen(server);

// Set a stream listener for tweets matching tracking keywords
twit.stream('statuses/filter',{ track: '#EVSTK'}, function(stream){
  streamHandler(stream,io,twit);
   });

