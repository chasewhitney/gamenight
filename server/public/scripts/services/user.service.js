myApp.factory('UserService', function($http, $location){
  console.log('UserService Loaded');

  var userObject = {};

  return {


    userObject : userObject,

    getuser : function(){
      console.log('UserService -- getuser');
      $http.get('/user').then(function(response) {
          if(response.data.username) {
              // user has a curret session on the server
              userObject.userName = response.data.username;              
              userObject.email = response.data.email;
              userObject.name = response.data.name;
              userObject.location = response.data.location;
              userObject.age = response.data.age;
              userObject.gender = response.data.gender;
              userObject.favoriteGames = response.data.favoriteGames;
              userObject.contactInfo = response.data.contactInfo;
              userObject.aboutMe = response.data.aboutMe;




              console.log('RESPONSE.DATA:', response.data);
              console.log('UserService -- getuser -- User Data: ', userObject.userName);
          } else {
              console.log('UserService -- getuser -- failure');
              // user has no session, bounce them back to the login page
              $location.path("/home");
          }
      },function(response){
        console.log('UserService -- getuser -- failure: ', response);
        $location.path("/home");
      });
    },

    logout : function() {
      console.log('UserService -- logout');
      $http.get('/user/logout').then(function(response) {
        console.log('UserService -- logout -- logged out');
        $location.path("/home");
      });
    }
  };
});
