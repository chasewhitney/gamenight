myApp.controller('UserController', function(UserService, EventService, $http, $location, $mdDialog, NgMap) {
  console.log('UserController created');
  var vm = this;
  vm.userService = UserService;
  vm.eventService = EventService;

  vm.userObject = UserService.userObject;

  vm.eventToView = {};
  vm.searchZip = 55420;
  vm.editing = false;

  // Update user profile
  vm.updateUserProfile = function(){
    $http.put('/user/updateprofile', {user : vm.userObject}).then(function(response){
      vm.editing = !vm.editing;
    });
  };

  // Edit user profile
  vm.editProfile = function(){
    vm.editing = !vm.editing;
    vm.userService.getuser();

  };

  vm.setSearchZip = function(zip){
    vm.searchZip = zip;
  };

  vm.eventService.getMyEvents();

});
