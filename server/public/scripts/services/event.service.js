myApp.factory('EventService', function($http, $location){
  console.log('Event Loaded');

var ev = {};
ev.eventToView = {};
ev.myEvents =[];

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
  $http.put('/event/requestattend/' + id).then(function(response){
      console.log('got response from addtosaved PUT');
    });
};

return ev;

});
