var mongoose = require('mongoose');

// Create a new schema for our address data
var schema = new mongoose.Schema({
    twid       : String
  , active     : Boolean
  , addresstext      : String
  , line1      : String
  , line2      : String
  , line3      : String
  , line4      : String
  , city       : String
  , state      : String
  , citystate  : String
  , zip        : String
  , country    : String
  , metro      : String
  , neighborhood      : String
  , lat        : String
  , lng        : String
  , createdate : Date
  , updatedate : Date
  , url		   : String
  , image	   : String
  , phone	   : String
  , named    : String
  , tags       : [String]  
});


// Create a static getTweets method to return tweet data from the db
schema.statics.getAddress = function(twid, callback) {

  var addresses = [];

  Address.find({ 'twid': {exists : true}} ).exec(function(err,docs){
    if(!err) {
      addresses = docs;  //we go locations
    }
  });

    callback(addresses);


};

// Return an Address model based upon the defined schema
module.exports = Address = mongoose.model('Address', schema);
