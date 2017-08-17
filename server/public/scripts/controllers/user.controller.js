myApp.controller('UserController', function(UserService, EventService, $http, $location, $mdDialog, NgMap) {
  console.log('UserController created');
  var vm = this;
  vm.userService = UserService;
  vm.eventService = EventService;

  vm.userObject = UserService.userObject;
  console.log('UC userObject:', vm.userObject);

  vm.testVar = [];
  vm.eventToView = {};
  vm.searchZip = 55420;
  vm.editing = false;

  vm.updateUserProfile = function(){
    console.log('in updateUserProfile');
    console.log('sending vm.userObject', vm.userObject);
    $http.put('/user/updateprofile', {user : vm.userObject}).then(function(response){
      console.log('got response from updateUserProfile PUT');
      vm.editing = !vm.editing;
    });
  };

  vm.editProfile = function(){
    console.log('in editProfile');
    vm.editing = !vm.editing;
    vm.userService.getuser();

  };


  vm.mongooseTest = function(){
    console.log('in mongooseTest');

    var data = "this.host == 'a'";

    $http.get('/event/search/' + data).then(function(response){
        console.log('mongooseTest GET response:', response);
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



    vm.eventService.getEvents();
    vm.eventService.getMyEvents();

vm.test = function(){
  console.log('IN TEST');
  console.log('vm.testVar:', vm.testVar);

};







vm.test2 = function(x){
  console.log('in vm.test2');
$http.put('/event/testmailer').then(function(response){
  console.log('got response from test mailer');
});

};



});
