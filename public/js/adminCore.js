var amod = angular.module('adminApp', ['ngRoute', 'AdminCtrl', 'EditCtrl', 'todoService']);

  amod.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        // home page
        .when('/admin/', {
             templateUrl: '/views/home.html',
             controller: 'AdminController'
        })
        .when('/admin/edit/:id', {
             templateUrl: '/views/edit.html',
             controller: 'EditController',
             resolve: {
               eventRecord: function(Todos, $route){
                 var mongoID = $route.current.params.id;
                 return Todos.getEvent(mongoID);
                }
             }
        })
         .otherwise({
//             redirectTo: '/admin'
             templateUrl: '/views/home.html',
             controller: 'AdminController'
        });

     $locationProvider.html5Mode(true);
 //$locationProvider.html5mode({ enabled: true, baseLocation: false});
    }])


  .filter('startFrom', function(){

    return function(data, start){
         if (!data || !data.length) { return; }
        return data.slice(start);
    }

  })
;

