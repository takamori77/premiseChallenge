var Handlers = require('./handlers');

// All routes defined here
// All client side pages are in ./templates
// API calls are prefaced with API
// TODO: enhance API call to allow selecting and
//       responding to other users
var Routes = [{
  path: '/',
  method: 'GET',
  handler: {
    file: './templates/index.html'
  },
  config: {
    auth: false
  }
}, {
  path: '/assets/{path*}',
  method: 'GET',
  handler: {
    directory: {
      path: './public',
      listing: false
    }
  },
  config: {
    auth: false
  }
}, {
  path: '/login',
  method: 'GET',
  handler: {
    file: 'templates/login.html'
  },
  config: {
    auth: false
  }
}, {
  path: '/login',
  method: 'POST',
  handler: Handlers.loginHandler,

  config: {
    auth: false
  }
}, {
  path: '/logout',
  method: 'GET',
  handler: Handlers.logoutHandler,
  config: {
    auth: false
  }
}, {
  path: '/register',
  method: 'GET',
  handler: {
    file: 'templates/register.html'
  },
  config: {
    auth: false
  }
}, {
  path: '/register',
  method: 'POST',
  handler: Handlers.registerHandler,
  config: {
    auth: false
  }
}, {
  path: '/calendar',
  method: 'GET',
  handler: {
    file: 'templates/calendar.html'
  },
}, {
  path: '/analyze',
  method: 'GET',
  handler: {
    file: 'templates/analyze.html'
  }
}, {
  path: '/api/violations',
  method: 'GET',
  handler: Handlers.currentViolationsHandler
}, {
  path: '/api/user',
  method: 'GET',
  handler: Handlers.currentUserHandler
}, {
  path: '/api/user',
  method: 'PUT',
  handler: Handlers.currentUserUpdateHandler
}, {
  path: '/api/users',
  method: 'GET',
  handler: Handlers.allUsersHandler
}];

module.exports = Routes;
