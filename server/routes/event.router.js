var express = require('express');
var router = express.Router();
var Event = require('../models/event.js');
var User = require('../models/user.js');
var path = require('path');
var request = require('request');
var nodemailer = require('nodemailer');

var emailUser = process.env.EMAIL_USER || require('../config.js').user;
var emailPass = process.env.EMAIL_PASS || require('../config.js').pass;
var transporter = nodemailer.createTransport({
    // host: 'smtp.example.com',
    service: 'Gmail',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

// setup email data with unicode symbols
var mailOptions = {
    from: '"Game Night 👻" <foo@blurdybloop.com>', // sender address
    to: 'chasefu@yahoo.com', // list of receivers
    subject: 'Thursday morning success', // Subject line
    text: 'Hello world? Where is this going?', // plain text body
    html: '<b>GameNight emailing is working on Thursday morning!</b>' // html body
};


sendMail = function(){
  transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
          return console.log(error);
      }
      // console.log('Message %s sent: %s', info.messageId, info.response);
      console.log('messageId:', info.messageId);
      console.log('response', info.response);
  });
};







// gives status tag to returned events for My Events page
alterData = function(data, name){
  console.log('alterData received: ', data);
  var newData = data;
  console.log('newData in alterData is: ', newData);
  for (var i = 0; i < newData.length; i++){
    newData[i].newpropertything= 'SOMETHING';
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
    } else if(newData[i].saved.includes(name)){
        newData[i].status = "saved";
    }
  }

  console.log('alterData returning: ', newData);
  return newData;
};


pendingToAttending = function(event, requester){
  console.log('requester in pendingToAttending is:', requester);
  console.log('event in pendingToAttending is:', event);
  var newEvent = event;

  var index = newEvent.pending.indexOf(requester);
  newEvent.pending.splice(index, 1);
  newEvent.attending.push(requester);


  return newEvent;
};

pendingToDenied = function(event, requester){
  console.log('requester in pendingToDenied is:', requester);
  console.log('event in pendingToDenied is:', event);
  var newEvent = event;

  var index = newEvent.pending.indexOf(requester);
  newEvent.pending.splice(index, 1);
  newEvent.denied.push(requester);


  return newEvent;
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
         { denied: name },
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

router.put('/filteredsearch/', function(req, res) {
  // find (select) all documents in our collection
  var searchParams = req.body;
  console.log('searchParams :', searchParams);
  Event.find({
    "$and": searchParams
}).exec(
    function(err, data) {
      if(err) {
        console.log('save error: ', err);
        res.sendStatus(500);
      } else {
        console.log('MYEVENTS GET RESULTS:', data);
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
    var newData={};
    var newAddress = addEvent.address.replace(/ /g, "+");
    console.log('newAddress is:', newAddress);
    var newCity = addEvent.city.replace(/ /g, "+");
    console.log('newCity is: ', newCity);
    var geoUrl = {
      url: 'http://maps.google.com/maps/api/geocode/json?address=' + newAddress + ',+' + newCity + ',+'+ addEvent.state,
    };

    console.log('geoUrl.url is: ', geoUrl.url);
    request(geoUrl, function (error, response, body) {
    if (response && response.statusCode == 200) {

      newData = JSON.parse(body);

      console.log('newData is:', newData);
      //console.log('newData[0] is:', newData[0]);
      console.log('newData.results[0] is:', newData.results[0]);
      addEvent.position[0] = newData.results[0].geometry.location.lat;
      addEvent.position[1] = newData.results[0].geometry.location.lng;
      addEvent.location = newData.results[0].formatted_address;

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
    } else {
      res.sendStatus(500);
    }
  });

  });

//update event information
  router.put('/updateevent', function(req, res){
    var newEvent = req.body;
    console.log('in PUT updateevent with newEvent:', newEvent);
    var newData = {};
    var newGeoUrl = {
      url: 'http://maps.google.com/maps/api/geocode/json?address=' + newEvent.address + ',+' + newEvent.city+ ',+'+ newEvent.state,
    };
    request(newGeoUrl, function (error, response, body) {
    if (response && response.statusCode == 200) {

      newData = JSON.parse(body);

      console.log('newData is:', newData);

      newEvent.position[0] = newData.results[0].geometry.location.lat;
      newEvent.position[1] = newData.results[0].geometry.location.lng;
      newEvent.location = newData.results[0].formatted_address;


      Event.findByIdAndUpdate({_id: newEvent._id},{skill: newEvent.skill, type: newEvent.type, img: newEvent.img, title: newEvent.title, date: newEvent.date, time: newEvent.time, address: newEvent.address, city: newEvent.city, state: newEvent.state, zipCode: newEvent.zipCode, description: newEvent.description, games: newEvent.games, position: newEvent.position, location: newEvent.location, closed: newEvent.closed},
      function(err, dbEvent) {
        if(err) {
          console.log('ERROR in updateprofile: ', err);
          res.sendStatus(500);
        } else {
          console.log('success. in update Event! Found and updated:', dbEvent );
          res.sendStatus(201);
        }
      });
    }
     else {
        res.sendStatus(500);
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

  // Add user to pending array on event - indicating user wants to attend the event
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
          });
        }
      }); // end findOne
    });

    // remove user from attend array
      router.put('/removeattend/:id', function(req,res){
        var eventId = req.params.id;
        console.log('eventId in requestattend is:', eventId);
        Event.findById(eventId,
        function(err, event) {
          if(err) {
            res.sendStatus(500);
          } else {
            console.log('success. in removeattend! Found:', event);
            var index = event.attending.indexOf(req.user.username);
            event.attending.splice(index, 1);



            event.save(function(err){
              if(err) {
                res.sendStatus(500);
              } else {
                res.sendStatus(201);
              }
            });
          }
        }); // end findOne
      });

      // remove user from pending array
        router.put('/cancelrequest/:id', function(req,res){
          var eventId = req.params.id;
          console.log('eventId in cancelrequest is:', eventId);
          Event.findById(eventId,
          function(err, event) {
            if(err) {
              res.sendStatus(500);
            } else {
              console.log('success. in cancelrequest! Found:', event);
              var index = event.pending.indexOf(req.user.username);
              event.pending.splice(index, 1);



              event.save(function(err){
                if(err) {
                  res.sendStatus(500);
                } else {
                  res.sendStatus(201);
                }
              });
            }
          }); // end findOne
        });

        // remove user from saved array
          router.put('/removefromsaved/:id', function(req,res){
            var eventId = req.params.id;
            console.log('eventId in removefromsaved is:', eventId);
            Event.findById(eventId,
            function(err, event) {
              if(err) {
                res.sendStatus(500);
              } else {
                console.log('success. in cancelrequest! Found:', event);
                var index = event.saved.indexOf(req.user.username);
                event.saved.splice(index, 1);



                event.save(function(err){
                  if(err) {
                    res.sendStatus(500);
                  } else {
                    res.sendStatus(201);
                  }
                });
              }
            }); // end findOne
          });



// approves requester to attend event. Removes requester from pending and adds to attending
router.put('/approverequest/:id',function(req, res){
  var eventId = req.params.id;
  var requester = req.body.requester;
  console.log('eventId in requestattend is:', eventId);
  console.log('requester in requestattend is:', requester);

  //remove requester from events pending list
  //add requester to attending list

  Event.findById(eventId,
  function(err, event) {
    if(err) {
      res.sendStatus(500);
    } else {
      console.log('success. in requestattend! Found:', event);
      event = pendingToAttending(event, requester);
      event.save(function(err){
        if(err) {
          res.sendStatus(500);
        } else {
          User.findOne({username : requester},
          function(err, user) {
            if(err) {
              res.sendStatus(500);
            } else {
              console.log('success. in requestattend find user! Found:', user);
              // mailOptions.to = user.email; //comment out for demo
              mailOptions.subject = req.body.event.title + " request accept!";
              mailOptions.html = "<b>Hello " + user.username + ", we have good news! Your request to attend " + req.body.event.title + " has been accepted! Have fun! :)</b>";
              sendMail();

              res.sendStatus(201);

            }
          });
        }
      })
    }
  });
});

// approves requester to attend event. Removes requester from pending and adds to attending
router.put('/denyrequest/:id',function(req, res){
  var eventId = req.params.id;
  var requester = req.body.requester;
  console.log('eventId in denyrequest is:', eventId);
  console.log('requester in denyrequest is:', requester);

  //remove requester from events pending list
  //add requester to denied list

  Event.findById(eventId,
  function(err, event) {
    if(err) {
      res.sendStatus(500);
    } else {
      console.log('success. in denyrequest! Found:', event);
      event = pendingToDenied(event, requester);

      event.save(function(err){
        if(err) {
          res.sendStatus(500);
        } else {
          res.sendStatus(201);
        }
      });
    }
  });
});



var repo_options = {
  url: 'http://maps.google.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA',
  // headers: {
  //   'User-Agent': 'request',
  //   'Authorization': 'token ' + oauthToken
  // }
};

router.delete('/deleteevent/:id', function(req,res){
  var eventId = req.params.id;
  console.log('eventId in addtosaved is:', eventId);
  Event.findByIdAndRemove(eventId,
  function(err, event) {
    if(err) {
      res.sendStatus(500);
    } else {
      console.log('success. in add to saved! Found:', event);
      res.sendStatus(200);
    }
}); // end findOne
});



router.get('/test', function(req, res){
  request(repo_options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      res.send(body);
    } else {
      res.sendStatus(500);
    }
  });
});

router.get('/', function(req, res, next) {
  console.log('get /register route');
  res.sendFile(path.resolve(__dirname, '../public/views/templates/info.html'));
});

module.exports = router;
