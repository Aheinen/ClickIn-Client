var express = require('express');
var router = express.Router();
var Session = require('../models/session');

// GET sessions listing
router.get('/', function(req, res, next) {

  Session.find({}, function(err, sessions) {
    if (err) throw err;

    res.json(sessions);
  });

});

// GET session by code
router.get('/:session_code', function(req, res, next) {

  Session.find({ code: req.params.session_code }, function(err, sessions) {
    if (err) throw err;

    res.json(sessions[0]);
  });

});

// PATCH session by code
router.patch('/:session_code', function(req, res, next) {

  Session.find({ code: req.params.session_code }, function(err, sessions) {
    if (err) throw err;

    for (var i = 0; i < sessions[0].poll.answers.length; i++) {
      if (sessions[0].poll.answers[i].id === req.body.id) {
        sessions[0].poll.question.count++;
        sessions[0].poll.answers[i].count++;
      }
    }

    sessions[0].save(function(err) {
      if (err) throw err;

      var io = require('../app').io;
      io.sockets.emit('result', sessions[0]);

      res.json(sessions[0]);
    });

  });

});

// POST new session
router.post('/', function(req, res, next) {

  var newSession = new Session(req.body);

  console.log(req.body);

  newSession.save(function(err) {
    if (err) throw err;

    setTimeout(function() {
      console.log('Session has ended');

      newSession.ended = true;

      newSession.save(function(err) {
        if (err) throw err;

        var io = require('../app').io;
        io.sockets.emit('end', sessions[0]);
      });
    }, 180000);

    res.json({ result: "success" });
  });

});

module.exports = router;