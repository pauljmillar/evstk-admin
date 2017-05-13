var mongoose = require('mongoose');

// Create a new schema for our tweet data
var schema = new mongoose.Schema({
    twid       : String
  , active     : Boolean
  , author     : String
  , avatar     : String
  , body       : String
  , createdate : Date
  , screenname : String
  , place      : String
  , eventdate  : Date
  , tags       : [String]
  , eventimage : String
  , eventurl   : String
  , homeurl    : String
  , eventday   : String
  , eventmonth : String
  , eventyear  : String
  , locationname: String
  , locationimage : String
  , lat        : String
  , lon        : String
  , loc: { type: { type: String, default:'Point' }, coordinates: [Number] }
  , source     : String
  , title      : String
  , metro      : String
  , eventurldefault      : String
  , likes      : Number
  , street     : String
  , phone	   : String
});


// Return a Tweet model based upon the defined schema
module.exports = Tweet = mongoose.model('Tweet', schema);
