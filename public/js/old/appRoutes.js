angular.module('appRoutes', [])

  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider

        // home page
        .when('/admin/', {
             templateUrl: 'views/home.html',
             controller: 'AdminController'
        })

        // home page
        //.when('/admin/load', {
        //     templateUrl: 'views/load.html',
        //     controller: 'LoadController'
        //})

        // nerds page that will use the NerdController
        .when('/admin/edit/:id', {
             templateUrl: 'views/edit.html',
             controller: 'EditController',
             resolve: {
               eventRecord: function(Todos, $route){
                 var mongoID = $route.current.params.id;
                 return Todos.getEvent(mongoID);
                }
             }
        })
         .otherwise({
             redirectTo: '/admin'
        });

     $locationProvider.html5Mode(true);
 //$locationProvider.html5mode({ enabled: true, baseLocation: false});
    }])


  .filter('startFrom', function(){

    return function(data, start){
         return data.slice(start);
    }

  })
;

