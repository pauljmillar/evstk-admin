angular.module('AdminCtrl', [])

  .controller('AdminController', ['$scope','$http','Todos', function($scope, $http, Todos) {

    $scope.chosenDay = 'Today';
    $scope.pageSize = 20;
    $scope.currentPage = 1;

    Todos.getAllEvents()
	.success(function(data) {
	   $scope.eventList = data;
	});

    $scope.deleteEvent = function(id) {
      //$location.path('/');
      if(confirm("Are you sure to delete event number: "+id)==true)
      Todos.deleteEvent(id);
      $location.path('/admin/');
    };

}]);
