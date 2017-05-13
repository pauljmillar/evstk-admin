var cont = angular.module('todoController', ['ui.bootstrap','tagged.directives.infiniteScroll','ngAnimate', 'angularGrid', 'ng']);

	// inject the Todo service factory into our controller
	cont.controller('MasterController', ['$scope','$http','Todos','$uibModal','metro','metrolatlon', 'imageService', 'angularGridInstance', function($scope, $http, Todos, $uibModal, metro, metrolatlon, imageService, angularGridInstance) {
		$scope.formData = {};
		$scope.loading = true;
		$scope.loadingmore = false;
		$scope.fetching = false;
		$scope.disabled = true;
		$scope.isLikeEnabled = true;

$scope.chosenMetro="hello";

$scope.metro = metro;
$scope.metrolatlon = metrolatlon;
var currentlatlon = metrolatlon;
$scope.sortDirection=true;

                $scope.selectedEvent = "";
		$scope.page=0;
                //$scope.donefetching = false;
                $scope.chosenDay="Today";
                $scope.chosenFilter="Filters";
                //$scope.chosenCity='Chicago, IL';
                $scope.chosenCity=metro;


       // $scope.filterList=[];
        $scope.dayList=["Today", "Tomorrow", "Weekend"];
        $scope.eventList=[];
var eventList;
       //default lon,lat
       //var chicaXgogeo = "-87.6297982,41.8781136";

//get local
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position){
      $scope.$apply(function(){
        //$scope.position = position;
        currentlatlon=position.coords.longitude+","+position.coords.latitude;
//rerun query just in case it has already run
$scope.daySelected("Today");
      });
    });
  }



	// GET =====================================================================
	// when landing on the page, get all events, cities, and filters


        //Get Events for default city, today
        //Todos.getEvents($scope.chosenCity, $scope.chosenDay, $scope.chosenFilter, $scope.page)
        //Todos.getMetro()
//			.success(function(data) {
//				$scope.metro = data;
//			});

        Todos.getEvents(metro, currentlatlon, $scope.chosenDay, $scope.chosenFilter, $scope.page)
			.success(function(data) {
				$scope.eventList = data;
				eventList=$scope.eventList;
				$scope.loading = false;
			});

		//Get Cities for dropdown
        Todos.getCities($scope.chosenDay, metro)
			.success(function(data) {
                                //inject current location option if geo allowed
                                if (navigator.geolocation) {
                                  data.unshift("Current Location");
		                  //cur location
                                }
				$scope.cityList = data;
                        	$scope.loading = false;
			});

		//Get Cities for dropdown
        Todos.getMetros($scope.chosenDay)
			.success(function(data) {
                                //inject current location option if geo allowed
                               // if (navigator.geolocation) {
                               //   data.unshift("Current Location");
		                  //cur location
                             //   }
				$scope.metroList = data;
                        	//$scope.loading = false;
			});

        //Get Filters for dropdown
        Todos.getFilters($scope.chosenDay, metro)
			.success(function(data) {
				$scope.filterList = data;
				$scope.loading = false;
				$scope.disabled = false;

			});


        // HANDLE ACTIONS =====================================================
        //handle day selection
        $scope.daySelected = function (day) {
		$scope.loading = true;
       	$scope.chosenDay = day;
		$scope.page = 0;
        	$scope.disabled=false;
            //$scope.donefetching = false;
        	//call reload tweets
        	//Todos.getEvents($scope.chosenCity, $scope.chosenDay, $scope.chosenFilter, $scope.page)
        	Todos.getEvents(metro, currentlatlon, $scope.chosenDay, $scope.chosenFilter, $scope.page)
				.success(function(data) {
					$scope.eventList = data;
					eventList=$scope.eventList;
					$scope.loading = false;
			});

    	};

        //handle city selection
        $scope.citySelected = function (city) {
		$scope.loading = true;
        	$scope.chosenCity = city;
        	//reset filters
       	 	$scope.chosenFilter = 'Filters';
		$scope.page = 0;
        	$scope.disabled=false;
                //$scope.donefetching = false;

       		Todos.getFilters($scope.chosenDay, metro)
				.success(function(data) {
					$scope.filterList = data;
					$scope.loading = false;
				});

       		//if current location,
  if (city=='Current Location') {
    navigator.geolocation.getCurrentPosition(function(position){
      $scope.$apply(function(){
        currentlatlon=position.coords.longitude+","+position.coords.latitude;
      });
    });
			Todos.getEvents(metro, currentlatlon, $scope.chosenDay, $scope.chosenFilter, $scope.page)
			    .success(function(data) {
			         $scope.eventList = data;
					 eventList=$scope.eventList;
			         $scope.loading = false;
			});


                } else {
                //else, city chosen, need to get sample lat/lon for chosen city
       		Todos.getEventsLoc($scope.chosenCity)
		   .success(function(data) {

			var lonlat = data.lon+","+data.lat;

			//call reload tweets
			//Todos.getEvents($scope.chosenCity, $scope.chosenDay, $scope.chosenFilter, $scope.page)
			Todos.getEvents(metro, lonlat, $scope.chosenDay, $scope.chosenFilter, $scope.page)
			    .success(function(data) {
			         $scope.eventList = data;
					eventList=$scope.eventList;
			         $scope.loading = false;
			});
		   });
               }
    	};

        //handle filter selection
        $scope.filterSelected = function (filter) {
			$scope.loading = true;
			$scope.page = 0;
            //$scope.donefetching = false;
        	$scope.chosenFilter = filter;
        	$scope.disabled=false;

        	//Todos.getEvents($scope.chosenCity, $scope.chosenDay, $scope.chosenFilter, $scope.page)
        	Todos.getEvents(metro, currentlatlon, $scope.chosenDay, $scope.chosenFilter, $scope.page)
				.success(function(data) {
					$scope.eventList = data;
					$scope.loading = false;
			});

    	};

        //handle filter selection
        $scope.updateLike = function (ev) {
			ev.likes = ev.likes+1 || 1;            //evt.likes = evt.likes || 0; //evt.likes++;
   		 	Todos.updateLike(ev._id);
		    $scope.isLikeEnabled = false;
    	};

        //infinite scroll call for more
        $scope.getMore = function() {
//          if (!$scope.donefetching) {
               $scope.page++;
               	$scope.fetching = true;
    			$scope.loadingmore = true;

//                    Todos.getEvents($scope.chosenCity, $scope.chosenDay, $scope.chosenFilter, $scope.page)
                    Todos.getEvents(metro, currentlatlon, $scope.chosenDay, $scope.chosenFilter, $scope.page)
				.success(function(data) {
					$scope.fetching = false;
                  //setTimeout(function(){
					$scope.loadingmore = false;
					//}, 1000);

				        if(data!='none'){  //none is hardcoded by service for no results
                                           //append new items
					   $scope.eventList = $scope.eventList.concat(data);
					   eventList=$scope.eventList;

                                           //$scope.donefetching = false;
                                        } else {
                                           $scope.disabled=true;
                                           //$scope.donefetching = true;
                                        }
			});
 //         }
       };

          $scope.openModal=function(ev) {
             $scope.selectedEvent=ev;

             $scope.modalInstance=$uibModal.open({
                templateUrl: 'myPopoverTemplate.html',
                animation: true,
                scope: $scope //,
                //,ev: ev//,
                //resolve: {
                //  eve: function() {
                //   return ev;
                //  }
                //}
             });
          }

         $scope.closeModal=function(){
            $scope.modalInstance.dismiss();
        };


        $scope.refresh = function(){
            angularGridInstance.gallery.refresh();
        }


		//apply search on the list base on searchTxt which can be binded to an input element
		$scope.$watch('searchTxt', function (val) {
//	   $scope.$searchChanged = function(val) {
		    val = val.toLowerCase();
		    $scope.eventList = eventList.filter(function (obj) {
		        return obj.title.toLowerCase().indexOf(val) != -1;
		    });
		});
//

/**
//apply filter based on type
		$scope.showImagesOfType  = function(type){
		    $scope.imageList = imageList.filter(function (obj) {
		        return obj.type == type;
		    });
		}
	**/

		//sort images by something (lets say likes)
		$scope.sortByLikes = function () {
			//$scope.chosenCity = "BOO";
		    $scope.eventList.sort(function (a, b) {
		        //return b.createdate - a.createdate;
		          //return new Date(b.date) - new Date(a.date);
		        return b.likes - a.likes;

		    });
		}
            $scope.sortByTime = function () {
                $scope.eventList.sort(function (a, b) {
                   // return b.createdate - a.createdate;
                	return new Date(b.createdate) - new Date(a.createdate);
				});
            }
}]);

