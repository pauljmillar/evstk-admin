var mainmod = angular.module('scotchTodo', ['ngRoute','todoController', 'todoService', 'angularGrid']);

  mainmod.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        // home page
        .when('/charlotte', {
             templateUrl: '/views/events_p.html',
             controller: 'MasterController',
             caseInsensitiveMatch: true,
             resolve: { metro: function(){ return 'Charlotte, NC'; }
                      , metrolatlon: function(){ return '-80.843124,35.227085' }
             }
        })
         .when('/chicago', {
             templateUrl: '/views/events_p.html',
             controller: 'MasterController',
             caseInsensitiveMatch: true,
             resolve: { metro: function(){ return 'Chicago, IL'; }
                      , metrolatlon: function(){ return '-87.6297982,41.8781136' }
             }
        })
        .when('/miami', {
             templateUrl: '/views/events_p.html',
             controller: 'MasterController',
             caseInsensitiveMatch: true,
             resolve: { metro: function(){ return 'Miami, FL'; }
                      , metrolatlon: function(){ return '-80.226439,25.788969' }
             }
        })
        .when('/portland', {
             templateUrl: '/views/events_p.html',
             controller: 'MasterController',
             caseInsensitiveMatch: true,
             resolve: { metro: function(){ return 'Portland, OR'; }
                      , metrolatlon: function(){ return '-122.676207,45.523452' }
             }
        })
         .when('/', {
             templateUrl: '/index.html',
             controller: 'MasterController',
             caseInsensitiveMatch: true,
             resolve: { metro: function(){ return 'Chicago, IL'; }
                      , metrolatlon: function(){ return '-87.6297982,41.8781136' }
             }
        })
        .otherwise({
             redirectTo: '/'
        });

        $locationProvider.html5Mode(true);



  }])
;


