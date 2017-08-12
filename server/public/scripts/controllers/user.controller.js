myApp.controller('UserController', function(UserService, EventService, $http, $location, $mdDialog, NgMap) {
  console.log('UserController created');
  var vm = this;
  vm.userService = UserService;
  vm.eventService = EventService;

  vm.userObject = UserService.userObject;
  console.log('UC userObject:', vm.userObject);

  vm.eventToView = {};
  vm.searchZip = 55420;

  vm.minDate = new Date();
  var dd = vm.minDate.getDate();
  var mm = vm.minDate.getMonth()+1; //January is 0!
  var yyyy = vm.minDate.getFullYear();

  if(dd<10) {
      dd = '0'+dd;
  }

  if(mm<10) {
      mm = '0'+mm;
  }
  vm.minDate = mm + '/' + dd + '/' + yyyy;

  vm.newEvent = {};
  vm.newEvent.games = [];

  vm.updateUserProfile = function(){
    console.log('in updateUserProfile');
    console.log('sending vm.userObject', vm.userObject);
    $http.put('/user/updateprofile', {user : vm.userObject}).then(function(response){
      console.log('got response from updateUserProfile PUT');
    });
  };



  vm.mongooseTest = function(){
    console.log('in mongooseTest');

    var data = "this.host == 'a'";

    $http.get('/event/search/' + data).then(function(response){
        console.log('mongooseTest GET response:', response);
        //if response is success, clear vm.newEvent and redirect to event page

      });
  };

  vm.createEvent = function(){
    console.log('creating event:', vm.newEvent);
    $http.post('/event/createEvent', vm.newEvent).then(function(response){
        console.log('createEvent response:', response);
        //if response is success, clear vm.newEvent and redirect to event page

      });
  };

  vm.setSearchZip = function(zip){
    vm.searchZip = zip;
    console.log("zip:",zip);
    console.log("vm.searchZip:", vm.searchZip);
  };

vm.testEvent = function(){
  console.log('date is:', vm.newEvent.date);
  console.log('date type is:', typeof (vm.newEvent.date));
};

vm.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
      'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
      'WY').split(' ').map(function(state) {
          return {abbrev: state};
        });

    vm.eventService.getEvents();
    vm.eventService.getMyEvents();

vm.test = function(){
  console.log('vm.userObject is: ',vm.userObject);

};


});
