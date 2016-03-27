(function() {
  var app = angular.module('dutyApp', []);

  var todo = {
    Server: [
      'Enhance API',
      'Refactor/Reorganize',
      'Integrate HTML Templating'
    ],
    User: ['Fix TimeSpans not persisting to Mongo'],
    UI: [
      'Calendar Page: Upgrade to Visual Calendar',
      'Analysis Page: Enhance Display Violations',
      'Analysis Page: Allow Admins to View other user violations',
      'Webpack/Browserify + Gulp/Grunt to Bundle JS',
      'Separate out Functionality from main.js'
    ]
  };

  var done = {
    Server: [
      'Hapi Setup',
      'Routing',
      'API',
      'Authentication',
      'Mongo',
      'Serverside Validation with Joi',
      'Basic Error Handling with Boom'
    ],
    User: ['Creation', 'Persistance'],
    Violations: [
      'MaxPerFourViolations Logic',
      'FullDayOffViolations Logic',
      'MinTimeBetweenShiftViolations Logic',
      'ShiftTooLongViolations Logic'
    ],
    UI: [
      'Nav Bar',
      'Nav Bar: Display Current User/Logout',
      'Nav Bar: Hide Login when Authenticated',
      'Nav Bar: Hide Logout when Not-Authenticated',
      'This Index Page',
      'Login Page',
      'Registration Page',
      'Calendar Page: Date Picker',
      'Calendar Page: Enter and Persist Shifts',
      'Calendar Page: Display Shifts',
      'Analysis Page: Display Violations',
      'Basic Angular Functionality',
    ]
  };

  app.controller('UserController', ['$http', function($http) {
    var uC = this;
    this.newShift = {};
    this.violations = {};
    this.todo = todo;
    this.done = done;

    $http.get('/api/user').success(function(data) {
      uC.user = data;
    });

    $http.get('/api/violations').success(function(data) {
      uC.violations = data;
    });

    this.addShift = function() {
      uC.user.timeSpans.push([this.newShift.start, this.newShift.stop]);
      this.newShift = {};
      $http.put('/api/user', uC.user);
    };
  }]);
})();

$(function() {
  $('#datetimepicker1').datetimepicker();
  $('#datetimepicker2').datetimepicker();
})
