angular.module('todoService', [])

	// super simple service
	// each function returns a promise object
	.factory('Todos', ['$http',function($http) {
		return {
			getCities : function(chosenDay, chosenMetro) {
				return $http.get('/api/cities/' + chosenDay + '/' + chosenMetro);
			},
			getFilters : function(chosenDay, chosenMetro) {
				return $http.get('/api/filters/' + chosenDay + '/' + chosenMetro);
			},
			getEvent : function(id) {
				return $http.get('/api/events/' + id);
			},
			getMetro : function() {
				return $http.get('/api/metro');
			},
			getMetros : function(chosenDay) {
				return $http.get('/api/metros/' + chosenDay);
			},
			getAllEvents : function() {
				return $http.get('/api/events');
			},
			getEvents : function(chosenMetro, latlon, chosenDay, chosenFilter, page) {
				console.log("/api/events/" + chosenMetro + "/" + latlon + "/" + chosenDay + "/" + chosenFilter + "/" + page);
				return $http.get('/api/events/' + chosenMetro + '/' + latlon + '/' + chosenDay + '/' + chosenFilter + '/' + page);
			},
			getEventsLoc : function(chosenCity) {
				console.log("/api/events/loc" + chosenCity);
				return $http.get('/api/events/loc/' + chosenCity);
			},
			get : function() {
				return $http.get('/api/todos');
			},
			createEvent : function(eventData) {
				return $http.post('/api/events', eventData).then(function (results){
					return results;
                                });
			},
			updateEvent : function(id, eventData) {
				return $http.put('/api/events/' + id, eventData).then(function (status){
                                  return status.data;
                                });
			},
			updateLike : function(id) {
				return $http.put('/api/events/like/' + id).then(function (status){
                                  return status.data;
                                });
			},			deleteEvent : function(id) {
				return $http.delete('/api/events/' + id);
			},
			create : function(todoData) {
				return $http.post('/api/todos', todoData);
			},
			delete : function(id) {
				return $http.delete('/api/todos/' + id);
			}
		}
	}])
	    .service('imageService',['$q','$http',function($q,$http){
        this.loadImages = function(){
            return $http.jsonp("https://api.flickr.com/services/feeds/photos_public.gne?format=json&jsoncallback=JSON_CALLBACK");
        };
    }])
;
