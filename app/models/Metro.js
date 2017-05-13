var mongoose = require('mongoose');

// Create a new schema for our address data
var schema = new mongoose.Schema({
    metro       : String
  , shortname   : String
  , active     : Boolean
  , loc: { type: { type: String, default:'Point' }, coordinates: [Number] }
  , country      : String
});



// Return an Address model based upon the defined schema
module.exports = Metro = mongoose.model('Metro', schema);
