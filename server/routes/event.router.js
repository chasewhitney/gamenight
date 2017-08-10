var express = require('express');
var router = express.Router();
var Event = require('../models/event.js');
var User = require('../models/user.js');
var path = require('path');


alterData = function(data, name){
  console.log('alterData received: ', data);
  var newData = data;
  console.log('newData in alterData is: ', newData);
  for (var i = 0; i < newData.length; i++){
    newData[i].newpropertything= 'WHATEVER';
    console.log('in alterData for loop');
    if (newData[i].admin.includes(name)){
      console.log('test true for admin.includes in alterData');
      newData[i].status = "admin";
      console.log('newData[i] after status change is:', newData[i]);
    } else if(newData[i].attending.includes(name)){
        newData[i].status = "attending";
    } else if(newData[i].denied.includes(name)){
        newData[i].status = "denied";
    } else if(newData[i].pending.includes(name)){
        newData[i].status = "pending";
    }


  }

  console.log('alterData returning: ', newData);
  return newData;
};


// Get search results based on filter sent by user
router.get('/search/:searchParam', function(req, res) {
  var searchParam = req.params.searchParam;

  console.log('searchParam:', searchParam);
  Event.$where(searchParam).exec(
    function(err, data) {
      if(err) {
        console.log('save error: ', err);
        res.sendStatus(500);
      } else {
        console.log('TEST GET RESULTS:', data);
        res.send(data);
      }
  });
});

// searches for events related to user
router.get('/myevents/', function(req, res) {
  // find (select) all documents in our collection
  var name = req.user.username;
  console.log('name is :', name);
  Event.find({
    "$or": [
         { pending: name },
         { attending: name },
         { saved: name },
         { admin: name },
     ]
}).exec(
    function(err, data) {
      if(err) {
        console.log('save error: ', err);
        res.sendStatus(500);
      } else {
        console.log('MYEVENTS GET RESULTS:', data);
        data = alterData(data, name);
        res.send(data);
      }
  });
});

// Search all events
router.get('/search', function(req, res) {
  // find (select) all documents in our collection
  Event.find({}, function(err, data) {
    if(err) {
      console.log('find error:', err);
      res.sendStatus(500);
    } else {
      res.send(data);

    }
  });
});


// Create an event
router.post('/createEvent', function(req, res) {
  console.log('log the data: ', req.body);
  console.log('log the user: ', req.user);

    // create an object instance from our Listing model
    var addEvent = new Event(req.body);
    addEvent.host = req.user.username;
    // insert into our collection
    addEvent.save(function(err, data) {
      console.log('saved data:', data);
      if(err) {
        console.log('save error: ', err);
        res.sendStatus(500);
      } else {

        Event.findById(data._id,
        function(err, event) {
          if(err) {
            res.sendStatus(500);
          } else {
            console.log('success. in add to admin! Found:', event);
              event.admin.push(req.user.username);
            event.save(function(err){
              if(err) {
                res.sendStatus(500);
              } else {
                res.sendStatus(201);
              }
            })
          }
      });



      }
    });
  });


// Add user to saved array on event - indicating user has saved the event
  router.put('/addtosaved/:id', function(req,res){
    var eventId = req.params.id;
    console.log('eventId in addtosaved is:', eventId);
    Event.findById(eventId,
    function(err, event) {
      if(err) {
        res.sendStatus(500);
      } else {
        console.log('success. in add to saved! Found:', event);
        if(!event.saved.includes(req.user.username)){
          event.saved.push(req.user.username);
        }


        event.save(function(err){
          if(err) {
            res.sendStatus(500);
          } else {
            res.sendStatus(201);
          }
        })
      }
  }); // end findOne
  });

  // Add user to saved array on event - indicating user has saved the event
    router.put('/requestattend/:id', function(req,res){
      var eventId = req.params.id;
      console.log('eventId in requestattend is:', eventId);
      Event.findById(eventId,
      function(err, event) {
        if(err) {
          res.sendStatus(500);
        } else {
          console.log('success. in requestattend! Found:', event);
          if(!event.pending.includes(req.user.username)){
            event.pending.push(req.user.username);
          }


          event.save(function(err){
            if(err) {
              res.sendStatus(500);
            } else {
              res.sendStatus(201);
            }
          })
        }
    }); // end findOne
    });


router.get('/', function(req, res, next) {
  console.log('get /register route');
  res.sendFile(path.resolve(__dirname, '../public/views/templates/info.html'));
});

module.exports = router;
