var bcrypt = require('bcrypt'),
  Boom = require('boom'),
  database = require('./database');

var UserStore = {};

// Retreive user document from Mongo datastore based
// on email address.
UserStore.getUser = function(email, callback) {
  database.getDb(function(err, db) {
    if (err) {
      callback(err);
    } else {
      db.users.findOne({
        email: email
      }, function(err, user) {
        if (user === null) {
          callback(err, null);
        } else {
          callback(null, user);
        }
      });
    }
  });
};

// WIP retrieve all user documents from Mongo datastore
UserStore.getAllUsers = function(callback) {
  var users = [];
  database.getDb(function(err, db) {
    if (err) {
      callback(err, null);
    } else {
      var myCursor = db.users.find();
      while (myCursor.hasNext()) {
        users.push(myCursor.next());
      }
      callback(null, users);
    }
  });
}

// This will add a user to the mongo datastore
// WIP: This upsert should add or update, but update is
// not functioning properly
UserStore.addUser = function(user, callback) {
  database.getDb(function(err, db) {
    if (err) {
      callback(err);
    } else {
      db.users.update({
        email: user.email
      }, user, {
        upsert: true
      }, callback(null));
    }
  });
};

// Used to register new users, checks to ensure user is not
// already in Mongo datastore.
// If validated new user, uses bcrypt to generate a password
// hash and add user to Mondo datastore.
UserStore.createUser = function(email, password, callback) {
  UserStore.getUser(email, function(err, user) {
    if (user) {
      callback(Boom.conflict('Email already exists. Please login.'));
    } else {
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
          var user = {
            email: email,
            passwordHash: hash,
            admin: false,
            timeSpans: []
          };
          UserStore.addUser(user, function(err) {
            if (err) {
              callback(Boom.badImplementation('Server Error.'));
            } else {
              callback();
            }
          });
        });
      });
    }
  });
}

// Compares hashes provided password and attempts to match with
// hash in Mongo database.
UserStore.validateUser = function(email, password, callback) {
  UserStore.getUser(email, function(err, user) {
    if (user === null) {
      callback(Boom.notFound('User does not exist.'));
    } else {
      bcrypt.compare(password, user.passwordHash, function(err, isValid) {
        if (!isValid) {
          callback(Boom.unauthorized('Password does not match.'));
        } else {
          callback(null, user);
        }
      });
    }
  });
};

module.exports = UserStore;
