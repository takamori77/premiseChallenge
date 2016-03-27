var  Joi = require('joi'),
  Boom = require('boom'),
  UserStore = require('./userStore'),
  Violations = require('./violations');

var Handlers = {};

// Setup some Schema for Joi to validate login and registration
var loginSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().max(32).required()
});

var registerSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().max(32).required(),
});

// Handler for user login
Handlers.loginHandler = function(request, reply) {
  Joi.validate(request.payload, loginSchema, function(err, val) {
    if (err) {
      return reply(Boom.unauthorized('Credentials did not validate.'));
    }
    UserStore.validateUser(val.email, val.password, function(err, user) {
      if (err) {
        return reply(err);
      }
      // request.auth.session.set(user);
      request.cookieAuth.set(user);
      reply.redirect('/');
    });
  });
};

// Handler to return user information, used in API
// JSON format
Handlers.currentUserHandler = function(request, reply) {
  reply(request.auth.credentials)
};

// Handler to return current users violations, used in API
// JSON format
Handlers.currentViolationsHandler = function(request, reply) {
  var shifts = request.auth.credentials.timeSpans;
  reply(Violations.getViolations(shifts));
};

// WIP:  This will return a list of all users. admin
//       will be able to select user to view their violations.
//       Used in API, JSON format
Handlers.allUsersHandler = function(request,reply){
  if(!request.auth.credentials.admin){
    reply(Boom.unauthorized('You are not an admin.'));
  }
  UserStore.getAllUsers(function(err,users){
    reply(users);
  });
}

// This will update a user from a PUT API callback
// Successfully updates session
// TODO: Address Mongo datastore not updating
Handlers.currentUserUpdateHandler = function(request, reply) {
  var user = request.payload;
  request.cookieAuth.set(user);
  UserStore.addUser(user, function(err) {
    if (err) {
      reply(err);
    } else {
      reply.redirect('/calendar');
    }
  });
}

// Clear user session and redirect to home
Handlers.logoutHandler = function(request, reply) {
  request.cookieAuth.clear();
  reply.redirect('/');
}

// Attempt to register a new user
Handlers.registerHandler = function(request, reply) {
  Joi.validate(request.payload, registerSchema, function(err, val) {
    if (err) {
      return reply(Boom.unauthorized('Credentials did not validate.'));
    }
    UserStore.createUser(val.email, val.password, function(err) {
      if (err) {
        return reply(err);
      }
      reply.redirect('/');
    });
  });
}

module.exports = Handlers;
