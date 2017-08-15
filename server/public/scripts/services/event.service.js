myApp.factory('EventService', function($http, $location, UserService, NgMap){
  console.log('Event Loaded');

var ev = {};

NgMap.getMap().then(function(map) {
    console.log('map', map);
    ev.map = map;
  });


  ev.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
        'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
        'WY').split(' ').map(function(state) {
            return {abbrev: state};
          });

ev.newEvent = {};
ev.newEvent.games = [];
ev.eventToEdit = {};
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

ev.client = filestack.init('Asuq5FpJHThCT68CMbHISz');

ev.returnPicker = function() {
  var newImg = [];
    ev.client.pick({
    }).then(function(result) {
        console.log(JSON.stringify(result.filesUploaded));
        console.log(result.filesUploaded[0].url);

        console.log('type:', typeof newImg);
        newImg[0] = "https://cdn.filestackcontent.com/";
        var temp = result.filesUploaded[0].handle;
        newImg[1] = temp;
        console.log('img:', newImg);
        console.log('type:', typeof newImg);
        console.log('0:', newImg[0]);
        console.log('1:', newImg[1]);
        console.log('type 0:', typeof newImg[0]);
        console.log('type 1:', typeof newImg[1]);

    });
    return newImg;
};


ev.showDetail = function(e, event) {
  ev.event = event;
  console.log('event in showDetail is: ', event);
  console.log('event._id in showDetail is: ', event._id);
  ev.map.showInfoWindow('foo-iw', event._id);
};

ev.hideDetail = function() {
  ev.map.hideInfoWindow('foo-iw');
};

ev.updateEvent = function(){
  console.log('in updateEvent, sending ev.eventToView: ', ev.eventToView);

  swal(
    'This should attract more bugs to your web!',
    'Event updated!',
    'success'
  );

  $http.put('/event/updateevent', ev.eventToView).then(function(response){
    console.log('got response from updateEvent PUT');
  });
};

ev.goToEvent = function(viewEvent){
  console.log('goToEvent event is:', viewEvent);
  ev.eventToView = viewEvent;
  $location.path('/viewevent');
};

ev.goToEditEvent = function(viewEvent){
  console.log('goToEditEvent event is:', viewEvent);
  ev.eventToView = viewEvent;
  $location.path('/editmyevent');
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

ev.requestToAttend = function(id){
  console.log('requesting to Attend id:', id);
  console.log('ev.eventToView is:', ev.eventToView);

  swal(
    "Now it's up to the host!",
    "(We'll put in a good word.)",
    'success'
  )

  $http.put('/event/requestattend/' + id).then(function(response){
      console.log('got response from addtosaved PUT');
    });
    ev.getMyEvents();
};

ev.getEvents = function(){
  $http.get('/event/search').then(function(response){
      console.log('mongooseTest GET response:', response);
      ev.eventArray = response.data;
      console.log('eventArray is: ', ev.eventArray);

    });
};




// admin approves pending request
ev.approveRequest = function(eventId, requester){
  console.log('in approveRequest');
  console.log('requester is:',requester);
  console.log('eventId is:', eventId);
  $http.put('/event/approverequest/' + eventId, {requester:requester}).then(function(response){
    console.log('got response from approveRequest PUT');
    ev.getMyEvents();
  });


};

ev.cancelAttend = function(eventId){
  console.log('in cancelAttend with id:', eventId);

  swal({
    title: 'Are you sure?',
    text: "It won't be the same without you.",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: "I'm not going!"
  }).then(function () {
    swal(
      'You are freed of the burden of obligation.',
      'You are no longer listed as attending.',

      'success'
    );
    $http.put('/event/removeattend/' + eventId).then(function(response){
      console.log('received response from cancelAttend PUT');
      ev.getMyEvents();
    });
  });


};

ev.cancelRequest = function(eventId){
  console.log('in cancelRequest with id:', eventId);
  swal({
    title: 'Are you sure?',
    text: "You can always re-request to attend.",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: "Yes, cancel my request!"
  }).then(function () {
    $http.put('/event/cancelrequest/' + eventId).then(function(response){
      console.log('received response from cancelRequest PUT');
      ev.getMyEvents();
    });
    swal(
      'Done!',
      'Your request to attend as been canceled.',
      'success'
    )
  })

};

ev.removeFromSaved = function(eventId){
  console.log('in removeFromSaved with id:', eventId);
  $http.put('/event/removefromsaved/' + eventId).then(function(response){
    console.log('received response from removeFromSaved PUT');

    ev.getMyEvents();
  });
};

ev.createEvent = function(){
  console.log('creating event:', ev.newEvent);
  $http.post('/event/createEvent', ev.newEvent).then(function(response){
      console.log('createEvent response:', response);
      swal(
      'Event created!',
      'Game on!',
      'success'
    );
    $location.path('/myevents');
      //if response is success, clear vm.newEvent and redirect to event page

    });
};

ev.deleteEvent = function(eventId){
  console.log('in deleteEvent with id:', eventId);
  swal({
    title: 'Are you sure?',
    text: "Deleting the event cannot be undone.",
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: "Yes, delete my event!"
  }).then(function () {
    $http.delete('/event/deleteevent/' + eventId).then(function(response){
      console.log('received response from deleteEvent REMOVE');
      ev.getMyEvents();
    });
    swal(
      'Done!',
      'Your event has been deleted.',
      'success'
    );
  });
};

ev.test = function(){
  console.log('ev.eventToView.img:',ev.eventToView.img);

};

return ev;

});
