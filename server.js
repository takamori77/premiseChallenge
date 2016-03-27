var Hapi = require('hapi'),
  Inert = require('inert'),
  UserStore = require('./lib/userStore');

var server = new Hapi.Server();

server.connection({
  port: 3000
});

// WIP: Preparation for using a view/templating engine
// server.views({
//   engines: {
//     'vash':{
//       module: require('vash')
//     }
//   },
//   //   vash: require('vash'),
//   //   html: require('vash')
//   // },
//   path: './templates'
// });

// Lots of logging available here, turned off
// server.register({
//     register: require('good'),
//     options: {
//       opsInterval: 50000,
//       reporters: [{
//         reporter: require('good-file'),
//         events: {
//           ops: '*'
//         },
//         config: {
//           path: './logs',
//           prefix: 'hapi-process',
//           rotate: 'daily'
//         }
//       }, {
//         reporter: require('good-file'),
//         events: {
//           response: '*'
//         },
//         config: {
//           path: './logs',
//           prefix: 'hapi-requests',
//           rotate: 'daily'
//         }
//       }, {
//         reporter: require('good-file'),
//         events: {
//           error: '*'
//         },
//         config: {
//           path: './logs',
//           prefix: 'hapi-error',
//           rotate: 'daily'
//         }
//       }]
//     }
//   },
//   function(err) {
//     console.log(err);
//   });

// Setup authentication Strategy
server.register(require('hapi-auth-cookie'), function(err) {
  if (err) console.log(err);

  server.auth.strategy('default', 'cookie', {
    password: 'myPasswordmyPasswordmyPasswordmy',
    redirectTo: '/login',
    isSecure: false
  });

  server.auth.default('default');
});

server.register(Inert, function(){
  // Setup all routing
  server.route(require('./lib/routes'));

  server.start(function() {
    console.log('Listening on ' + server.info.uri);
  });
});

// Intercept errors and format with Boom
server.ext('onPreResponse', function(request, reply) {
  if (request.response.isBoom) {
    return reply(request.response.output.payload);
  }
  reply.continue();
});

// Some console logging to watch requests during development
server.ext('onRequest', function(request, reply) {
  console.log(request.method + ' request at ' + request.path);
  reply.continue();
});
