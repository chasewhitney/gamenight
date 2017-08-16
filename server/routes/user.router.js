var express = require('express');
var router = express.Router();
var Users = require('../models/user.js');


alterUser = function(user){
  console.log('in alterUser with user:', user);
  delete user.password;
  delete user.email;
  return user;
};


/// IN PROGRESS ///
// update user profile
router.put('/updateprofile', function(req,res){
  console.log('in /user/updateprofile');
  console.log('req.user.username is:', req.user.username);
  var data = req.body.user;
  var currentUser = req.user.username;
  var newContactInfo = data.contactInfo;
  var newAge = data.age;
  var newGender = data.gender;
  var newAboutMe = data.aboutMe;
  var newFavoriteGames = data.favoriteGames;
  var newLocation = data.location;
  var newName = data.name;
  var newImg = data.img;
  console.log('req.body.user.userName is: ', currentUser);



  Users.findOneAndUpdate({username: currentUser},{img: newImg, contactInfo: newContactInfo, name: newName, age: newAge, gender: newGender, location: newLocation, favoriteGames : newFavoriteGames, aboutMe: newAboutMe},
  function(err, dbUser) {
    if(err) {
      console.log('ERROR in updateprofile: ', err);
      res.sendStatus(500);
    } else {
      console.log('success. in add to saved! Found and updated:', dbUser );
      res.sendStatus(201);
      }


      // event.save(function(err){
      //   if(err) {
      //     res.sendStatus(500);
      //   } else {
      //     res.sendStatus(201);
      //   }
      // })

});

});

// Handles Ajax request for user profile
router.get('/userprofile/:id', function(req, res) {
  // find (select) all documents in our collection
  var userToView = req.params.id;
  console.log('userToView is :', userToView);
  Users.findOne(

         { username: userToView}

).lean().exec(
    function(err, data) {
      if(err) {
        console.log('save error: ', err);
        res.sendStatus(500);
      } else {
        console.log('MYEVENTS GET RESULTS:', data);
        data = alterUser(data);
        res.send(data);
      }
  });
});






// Handles Ajax request for user information if user is authenticated
router.get('/', function(req, res) {
  console.log('get /user route');
  // check if logged in
  if(req.isAuthenticated()) {
    // send back user object from database
    console.log('logged in', req.user);
    var userInfo = {
      username : req.user.username,
      name : req.user.name,
      location : req.user.location,
      email: req.user.email,
      age: req.user.age,
      gender: req.user.gender,
      favoriteGames: req.user.favoriteGames,
      contactInfo: req.user.contactInfo,
      aboutMe: req.user.aboutMe,
      img: req.user.img,
    };
    res.send(userInfo);
  } else {
    // failure best handled on the server. do redirect here.
    console.log('not logged in');
    // should probably be res.sendStatus(403) and handled client-side, esp if this is an AJAX request (which is likely with AngularJS)
    res.send(false);
  }
});

// clear all server session information about this user
router.get('/logout', function(req, res) {
  // Use passport's built-in method to log out the user
  console.log('Logged out');
  req.logOut();
  res.sendStatus(200);
});


module.exports = router;
