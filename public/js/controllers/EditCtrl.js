//var Tweet = require('../../../app/models/Tweet');

angular.module('EditCtrl', ['ui.bootstrap'])

  .controller('EditController', ['$location', '$scope','$http','Todos',  '$routeParams', 'eventRecord', function($location, $scope, $http, Todos,  $routeParams, eventRecord) {

  //var mongoID = ($routeParams.id) ? parseInt($routeParams.id) : 0;
  var mongoID = $routeParams.id;
  $scope.title = (mongoID == 0) ? 'Add Event' : 'Edit Event';
  $scope.buttonText = (mongoID == 0) ? 'Add New Event' : 'Edit Event';

//  if (mongoID != 0) {
//    Todos.getEvent(mongoID)
//    .success(function(data) {
//       $scope.eventRecord = data;
//    });
//  }
var original = eventRecord.data;
original._id = mongoID;
$scope.eventRecord = angular.copy(original);
$scope.eventRecord._id = mongoID;

if (mongoID == 0) {
//$scope.eventRecord = new Tweet();
  $scope.eventRecord.active = true;
  $scope.eventRecord.author = 'daily';
  $scope.eventRecord.screenname = 'thefulldaily';
var dt = new Date();
   var month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  $scope.eventRecord.eventdate = dt;
  $scope.eventRecord.eventday = dt.getDate().toString();
var mth = dt.getMonth();
  $scope.eventRecord.eventmonth = month[mth];
  $scope.eventRecord.eventyear = dt.getFullYear().toString();
  $scope.eventRecord.place = 'Chicago, IL';
} 

$scope.isClean = function() {
  return angular.equals(original, $scope.eventRecord);
}

$scope.deleteEvent = function(eventRecord) {
  //$location.path('/');
  if(confirm("Are you sure to delete event number: "+$scope.eventRecord._id)==true)
    Todos.deleteEvent(eventRecord._id);
    $location.path('/admin/');
  };

$scope.saveEvent = function(eventRecord) {
  //$location.path('/');
  if (mongoID == 0) {
    Todos.createEvent(eventRecord);
  } else {
    Todos.updateEvent(mongoID, eventRecord);
  }
$location.path('/admin/');
};

}]);

