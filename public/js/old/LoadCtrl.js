var request = require('request');
var cheerio = require('cheerio');


angular.module('LoadCtrl', [])

  .controller('LoadController', ['$scope','$http','Todos', function($scope, $http, Todos) {

    url = 'http://www.imdb.com/title/tt1229340/';
    $scope.title = 'none';
    $scope.release = 'none';
 
    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);

            var title, release, rating;
            var json = { title : "", release : "", rating : ""};

            $('.header').filter(function(){
                var data = $(this);
                title = data.children().first().text();
            
                release = data.children().last().children().text();

                json.title = title;
                json.release = release;
                $scope.title=title;
                $scope.release=release;

            })
         }
     })

//    Todos.getAllEvents()
//	.success(function(data) {
//	   $scope.eventList = data;
//	});

}]);
