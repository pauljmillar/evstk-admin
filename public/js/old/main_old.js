angular.module('todoController', ['ui.bootstrap','tagged.directives.infiniteScroll'])

	// inject the Todo service factory into our controller
	.controller('mainController', ['$scope','$http','Todos', function($scope, $http, Todos) {
		$scope.formData = {};
		$scope.loading = true;
		$scope.loadingmore = false;
		$scope.fetching = false;
		$scope.disabled = true;

		$scope.page=0;
                //$scope.donefetching = false;
        $scope.chosenDay="Today";
        $scope.chosenFilter="Filters";
        $scope.chosenCity='Chicago, IL';

       // $scope.filterList=[];
        $scope.dayList=["Today", "Tomorrow", "Weekend"];
        $scope.eventList=[];



		// GET =====================================================================
		// when landing on the page, get all todos and show them
		// use the service to get all the todos
		Todos.get()
			.success(function(data) {
				$scope.todos = data;
				$scope.loading = false;
			});

        //Get Cities for dropdown
        Todos.getEvents($scope.chosenCity, $scope.chosenDay, $scope.chosenFilter, $scope.page)
			.success(function(data) {
				$scope.eventList = data;
				$scope.loading = false;
			});

		//Get Cities for dropdown
        Todos.getCities($scope.chosenDay)
			.success(function(data) {
				$scope.cityList = data;
				$scope.loading = false;
			});

        //Get Filters for dropdown
        Todos.getFilters($scope.chosenCity, $scope.chosenDay)
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
        	Todos.getEvents($scope.chosenCity, $scope.chosenDay, $scope.chosenFilter, $scope.page)
				.success(function(data) {
					$scope.eventList = data;
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

       		Todos.getFilters($scope.chosenCity, $scope.chosenDay)
				.success(function(data) {
					$scope.filterList = data;
					$scope.loading = false;
				});
        	//call reload tweets
        	Todos.getEvents($scope.chosenCity, $scope.chosenDay, $scope.chosenFilter, $scope.page)
				.success(function(data) {
					$scope.eventList = data;
					$scope.loading = false;
			});

    	};

        //handle filter selection
        $scope.filterSelected = function (filter) {
			$scope.loading = true;
			$scope.page = 0;
            //$scope.donefetching = false;
        	$scope.chosenFilter = filter;
        	$scope.disabled=false;

        	Todos.getEvents($scope.chosenCity, $scope.chosenDay, $scope.chosenFilter, $scope.page)
				.success(function(data) {
					$scope.eventList = data;
					$scope.loading = false;
			});

    	};

        //infinite scroll call for more
        $scope.getMore = function() {
//          if (!$scope.donefetching) {
               $scope.page++;
               	$scope.fetching = true;
    			$scope.loadingmore = true;

                    Todos.getEvents($scope.chosenCity, $scope.chosenDay, $scope.chosenFilter, $scope.page)
				.success(function(data) {
					$scope.fetching = false;
                  //setTimeout(function(){
					$scope.loadingmore = false;
					//}, 1000);

				        if(data!='none'){  //none is hardcoded by service for no results
                                           //append new items
					   $scope.eventList = $scope.eventList.concat(data);
                                           //$scope.donefetching = false;
                                        } else {
                                           $scope.disabled=true;
                                           //$scope.donefetching = true;
                                        }
			});
 //         }
       };

                // CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.createTodo = function() {

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if ($scope.formData.text != undefined) {
				$scope.loading = true;

				// call the create function from our service (returns a promise object)
				Todos.create($scope.formData)

					// if successful creation, call our get function to get all the new todos
					.success(function(data) {
						$scope.loading = false;
						$scope.formData = {}; // clear the form so our user is ready to enter another
						$scope.todos = data; // assign our new list of todos
					});
			}
		};

		// DELETE ==================================================================
		// delete a todo after checking it
		$scope.deleteTodo = function(id) {
			$scope.loading = true;

			Todos.delete(id)
				// if successful creation, call our get function to get all the new todos
				.success(function(data) {
					$scope.loading = false;
					$scope.todos = data; // assign our new list of todos
				});
		};
	}]);
