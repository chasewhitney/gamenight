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
  ev.userToView = {};
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
  ev.searchParams={};
  ev.searchParams.games=[];
  ev.event = ev.eventArray[0];

  // Gets events to display on map
  ev.getEvents = function(){
    $http.get('/event/search').then(function(response){
      console.log('mongooseTest GET response:', response);
      ev.eventArray = response.data;
      console.log('eventArray is: ', ev.eventArray);
    });
  };

  // Filters searched events by event type, skill level, and/or game
  ev.filteredSearch = function(){
    console.log('ev.searchParams is:', ev.searchParams);
    var searchArray = [];
    if(ev.searchParams.game){
      searchArray.push({ games: ev.searchParams.game});
    }
    if(ev.searchParams.skill && ev.searchParams.skill != "Any"){
      searchArray.push({ skill: ev.searchParams.skill});
    }
    if(ev.searchParams.type && ev.searchParams.type != "Any"){
      searchArray.push({ type: ev.searchParams.type});
    }
    console.log('searchArray is:', searchArray);
    if(searchArray.length > 0){
      $http.put('/event/filteredsearch/', searchArray).then(function(response){
        console.log('received response from filteredsearch PUT');
        ev.eventArray = response.data;
        console.log('eventArray is:', ev.eventArray);
      });
    } else {
      ev.getEvents();
    }
  };

  // Filestack upload image
  ev.client = filestack.init('Asuq5FpJHThCT68CMbHISz');
  ev.returnPicker = function() {
    var newImg = [];
    ev.client.pick({
    }).then(function(result) {
      console.log(JSON.stringify(result.filesUploaded));
      console.log(result.filesUploaded[0].url);
      newImg[0] = "https://cdn.filestackcontent.com/";
      var temp = result.filesUploaded[0].handle;
      newImg[1] = temp;
    });
    return newImg;
  };

  // Sets which icon will be displayed on map - grill, dice, or controller
  ev.getMarkerIcon = function(type){
    switch(type){
      case "board":
      return "https://cdn.filestackcontent.com/wB4xspHjRbleGDmjOqQq";
      case "outdoor":
      return "https://cdn.filestackcontent.com/Qi4VhBLTZzKUm3Qx9Mug";
      default:
      return "https://cdn.filestackcontent.com/qI8yPkrZTr2mOqx26xmh";
    }
  };

  // Shows details for selected event
  ev.showDetail = function(e, event) {
    ev.event = event;
    console.log('event in showDetail is: ', event);
    console.log('event._id in showDetail is: ', event._id);
    ev.map.showInfoWindow('foo-iw', event._id);
  };

  // Hides details for selected event
  ev.hideDetail = function() {
    ev.map.hideInfoWindow('foo-iw');
  };

  // Updates event info
  ev.updateEvent = function(){
    console.log('in updateEvent, sending ev.eventToView: ', ev.eventToView);
    swal(
      'Event Updated!',
      '',
      'success'
    );
    $http.put('/event/updateevent', ev.eventToView).then(function(response){
      console.log('got response from updateEvent PUT');
    });
  };

  // Links to page to view selected event in detail
  ev.goToEvent = function(viewEvent){
    console.log('goToEvent event is:', viewEvent);
    ev.eventToView = viewEvent;
    $location.path('/viewevent');
  };

  // Links to page to edit an event
  ev.goToEditEvent = function(viewEvent){
    console.log('goToEditEvent event is:', viewEvent);
    ev.eventToView = viewEvent;
    $location.path('/editmyevent');
  };

  // Add event to saved events
  ev.addToSaved = function(){
    var eid = ev.eventToView._id;
    console.log('id in addToSaved is:', eid);
    console.log('id :', typeof eid);
    $http.put('/event/addtosaved/' + eid).then(function(response){
      console.log('got response from addtosaved PUT');
      ev.eventToView.saved.push(ev.userObject.userName);
    });
  };


  // Get all events associated with user
  ev.getMyEvents = function(){
    $http.get('/event/myevents').then(function(response){
      console.log('getMyEvents GET response.data:', response.data);
      ev.myEvents = response.data;
      console.log('ev.myEvents is:', ev.myEvents);
    });
  };

  // Request to attend an event
  ev.requestToAttend = function(id){
    console.log('requesting to Attend id:', id);
    console.log('ev.eventToView is:', ev.eventToView);
    swal(
      "Now it's up to the host!",
      "(We'll put in a good word.)",
      'success'
    );
    $http.put('/event/requestattend/' + id).then(function(response){
      console.log('got response from addtosaved PUT');
    });
    ev.eventToView.pending.push(ev.userObject.userName);
    console.log('ev.eventToView is:', ev.eventToView);
    ev.getMyEvents();
  };

  // Admin approves pending request
  ev.approveRequest = function(event, requester){
    console.log('in approveRequest');
    console.log('requester is:',requester);
    console.log('event is:', event);
    var data = {};
    data.requester = requester;
    data.event = event;
    $http.put('/event/approverequest/' + event._id, data).then(function(response){
      console.log('got response from approveRequest PUT');
      var index = ev.eventToView.pending.indexOf(requester);
      ev.eventToView.pending.splice(index, 1);
      ev.getMyEvents();
    });
  };

  // Admin approves pending request
  ev.denyRequest = function(eventId, requester){
    console.log('in denyRequest');
    console.log('requester is:',requester);
    console.log('eventId is:', eventId);
    $http.put('/event/denyrequest/' + eventId, {requester:requester}).then(function(response){
      console.log('got response from approveRequest PUT');
      var index = ev.eventToView.pending.indexOf(requester);
      ev.eventToView.pending.splice(index, 1);
      ev.getMyEvents();
    });
  };

  // Remove user from list of Attending users
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
      console.log('sending PUT to /event/removeattend/'+ eventId);
      $http.put('/event/removeattend/' + eventId).then(function(response){
        console.log('received response from cancelAttend PUT');
        ev.getMyEvents();
      });
    });
  };

  // Cancel a request to attend an event
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
      );
    });
  };

  // Remove event from My Events
  ev.removeFromSaved = function(eventId){
    console.log('in removeFromSaved with id:', eventId);
    $http.put('/event/removefromsaved/' + eventId).then(function(response){
      console.log('received response from removeFromSaved PUT');
      ev.getMyEvents();
    });
  };

  // Create a new event
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

  // Delete an event
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

  // Gets a user to view then links to the view profile page
  ev.getUserProfile = function(username){
    console.log('in getUserProfile with username:', username);
    $http.get('/user/userprofile/' + username).then(function(response){
      console.log('received response from getUserProfile GET');
      ev.userToView = response.data;
      console.log('ev.userToView is:', ev.userToView);
      $location.path('/userprofile');
    });
  };

  // Sets color of events on My Events
  ev.getColor = function(type){
    console.log('in getColor');
    if(type == "board"){
      return "#e57737";
    } else if(type == "outdoor"){
      return "#39E589";
    } else {
      return "#6EC3E5";
    }
  };

  return ev;

});
