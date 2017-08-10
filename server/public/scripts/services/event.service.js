myApp.factory('EventService', function($http, $location, UserService, NgMap){
  console.log('Event Loaded');

var ev = {};

NgMap.getMap().then(function(map) {
    console.log('map', map);
    ev.map = map;
  });

ev.eventArray = [];
ev.userService = UserService;
ev.userObject = UserService.userObject;
ev.eventToView = {};
ev.myEvents =[];
ev.myRealEvents = {
  admin: [],
  attending: [],
  pending: [],
  saved: [],
  denied: [],
};

ev.event = ev.eventArray[0];

ev.showDetail = function(e, event) {
  ev.event = event;
  console.log('event in showDetail is: ', event);
  ev.map.showInfoWindow('foo-iw', event._id);
};

ev.hideDetail = function() {
  ev.map.hideInfoWindow('foo-iw');
};



ev.goToEvent = function(viewEvent){
  console.log('goToEvent event is:', viewEvent);
  ev.eventToView = viewEvent;
  $location.path('/viewevent');
};


// add event to saved events
ev.addToSaved = function(){
  var eid = ev.eventToView._id;
  console.log('id in addToSaved is:', eid);
  console.log('id :', typeof eid);
  $http.put('/event/addtosaved/' + eid).then(function(response){
      console.log('got response from addtosaved PUT');
    });
};


// get all events associated with user
ev.getMyEvents = function(){
    $http.get('/event/myevents').then(function(response){
        console.log('getMyEvents GET response.data:', response.data);
        ev.myEvents = response.data;
        console.log('ev.myEvents is:', ev.myEvents);
        // for(var i = 0; i < ev.myEvents.length; i++){
        //   if(ev.myEvents[i].admin.includes(ev.userObject.username)) {
        //
        //   }
        //
        // }


      });
  };

// // save event //// UNUSED?
// ev.saveEvent = function(id){
//   $http.put('/event/save/' + id).then(function(response){
//       console.log('got response from addtosaved PUT');
//     });
// };

// request to attend the event that is being viewed

ev.requestToAttend = function(){
  var id = ev.eventToView._id;
  console.log('requesting to Attend id:', id);
  $http.put('/event/requestattend/' + id).then(function(response){
      console.log('got response from addtosaved PUT');
    });
};

ev.getEvents = function(){
  $http.get('/event/search').then(function(response){
      console.log('mongooseTest GET response:', response);
      ev.eventArray = response.data;
      console.log('eventArray is: ', ev.eventArray);

    });
};

ev.test = function(e, dingle){
  console.log('TEST RECEIVED: ', dingle);
};

return ev;

});
