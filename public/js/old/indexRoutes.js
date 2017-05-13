angular.module('indexRoutes', [])

  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        // home page
        .when('/Chicago', {
             templateUrl: 'index.html',
             controller: 'ChicagoController'
        })
        // nerds page that will use the NerdController
        .when('/Charlotte', {
             templateUrl: 'index.html',
             controller: 'CharlotteController'
        })
        .otherwise({ 
             redirectTo: '/Chicago'
        });

  }])
;

