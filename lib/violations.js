var moment = require('moment');

var Violations = {};

// Central function that returns an object containing the four types of
// violations and associated data
Violations.getViolations = function(shifts) {
  var weeks = buildHoursPerWeek(shifts);
  var violations = {};
  violations.MaxPerFourViolations = FindMaxPerFourViolations(weeks);
  violations.FullDayOffViolations = FindFullDayOffViolations(weeks);
  violations.MinTimeBetweenShiftViolations = FindMinTimeBetweenShiftViolations(shifts);
  violations.ShiftTooLongViolations = FindShiftTooLongViolations(shifts);
  return violations;
}

// Searches for rule 1:
// Duty Hours must be limited to 80 hour/week averaged over a four-week period
// Returns all shifts for a each four week period that exceeds 320 Hours.
// Additionaly handling of only that shifts over 320 could be done here
// or in the violations display page.
function FindMaxPerFourViolations(weeks) {
  var MaxHoursPerFourWeeks = 60 * 80 * 4;
  var shiftViolations = [];
  // var FourWeekShiftViolation = {
  //   startingWeek: 1,
  //   shifts: [],
  //   minutes: 50000
  // };
  var shifts;
  var total;
  for (var week in weeks) {
    total = weeks[week].minutes;
    shifts = [];
    for (var shift of weeks[week].shifts) {
      shifts.push(shift);
    }
    if (weeks[week + 1]) {
      total += weeks[week + 1].hours;
      for (var shift of weeks[week].shifts) {
        shifts.push(shift);
      }
    }
    if (weeks[week + 2]) {
      total += weeks[week + 2].hours;
      for (var shift of weeks[week].shifts) {
        shifts.push(shift);
      }
    }
    if (weeks[week + 3]) {
      total += weeks[week + 3].hours;
      for (var shift of weeks[week].shifts) {
        shifts.push(shift);
      }
    }
    if (total > MaxHoursPerFourWeeks) {
      var shiftViolation = {
        startingWeek: week,
        shifts: shifts,
        miuntes: total
      };
      shiftViolations.push(shiftViolation);
    }
  }
  return shiftViolations;
}

// Searches for rule 2:
// Residents must have a 24-hour day off each week averaged over a four-week
// period.
// Returns the weeks starting each period that fails to have a 24 hour day off
// WIP: Needs to check for timeoff at beginning and end of week
function FindFullDayOffViolations(weeks) {
  var violations = [];
  var fullDaysOff = 0;
  var totalWeeks;
  for (var week in weeks) {
    fullDaysOff = CountFullDaysOff(weeks[week]);
    totalWeeks = 1;
    if (weeks[week + 1]) {
      totalWeeks++;
      fullDaysOff += CountFullDaysOff(weeks[week + 1]);
    }
    if (weeks[week + 2]) {
      totalWeeks++;
      fullDaysOff += CountFullDaysOff(weeks[week + 2]);
    }
    if (weeks[week + 3]) {
      totalWeeks++;
      fullDaysOff += CountFullDaysOff(weeks[week + 3]);
    }
    if ((fullDaysOff / totalWeeks) < 1) {
      violations.push(week);
    }
  }
  return violations;
}

// Searches for rule 3:
// A resident's individual shift must not exceed 24 hours of continuous dutyApp
// Returns All shifts that are longer than 24 hours.
function FindShiftTooLongViolations(shifts) {
  var startMoment, endMoment;
  var shiftViolations = [];

  for (var shift of shifts) {
    startMoment = moment(new Date(shift[0]));
    endMoment = moment(new Date(shift[1]));
    if (endMoment.diff(startMoment, 'minutes') > 60 * 24) {
      shiftViolations.push(shift);
    }
  }
  return shiftViolations;
}

// Searches for rule 4:
// A resident must have a minimum of 8 hours off between shifts
// Returns shifts that don't have 9 hours between
function FindMinTimeBetweenShiftViolations(shifts) {
  var violations = [];
  var sortedShifts = sortShifts(shifts);
  var startOffTimeOff, endOfTimeOff, timeOffHours;
  var length = sortedShifts.length;
  for (var i = 0; i < length; i++) {
    if (sortedShifts[i + 1]) {
      startOffTimeOff = moment(new Date(sortedShifts[i][1]));
      endOfTimeOff = moment(new Date(sortedShifts[i + 1][0]));
      timeOffHours = endOfTimeOff.diff(startOffTimeOff, 'hours');
      if (timeOffHours < 8) {
        violations.push([sortedShifts[i], sortedShifts[i + 1]]);
      }
    }
  }
  return violations;
}

// Helper function to add shift object to weeks object for particular week.
// Returns an updated weeks object
function addHoursToWeek(weeks, startMoment, duration, shift) {
  var weekNumber = startMoment.week();
  if (weeks[weekNumber]) {
    weeks[weekNumber].minutes = duration + weeks[weekNumber].minutes;
    weeks[weekNumber].shifts.push(shift);
  } else {
    var shiftObject = {
      minutes: duration,
      shifts: [shift]
    };
    weeks[weekNumber] = shiftObject;
  }
  return weeks;
}

// Creates weeks object that contains all weeks of work, total minutes
// per week, and the associated shifts.
// Returns weeks object
function buildHoursPerWeek(shifts) {
  var weeks = {
    // weekNumber: {
    //   minutes: 5,
    //   shifts: []
  };
  var weekStart, weekEnd;
  var startMoment, endMoment;
  var duration = 0;

  for (var shift of shifts) {
    startMoment = moment(new Date(shift[0]));
    endMoment = moment(new Date(shift[1]))
    weekStart = moment(new Date(shift[0])).startOf("week");
    weekEnd = moment(new Date(shift[0])).endOf("week");
    if (endMoment.isBefore(weekEnd)) {
      duration = endMoment.diff(startMoment, 'minutes');
      weeks = addHoursToWeek(weeks, startMoment, duration, shift);
    } else {
      duration = weekEnd.diff(startMoment, 'minutes');
      weeks = addHoursToWeek(weeks, startMoment, duration, shift);
      // Lets check the next week -- Need to ensure no shift is longer than 1 week
      weekStart = moment(new Date(shift[1])).startOf("week");
      duration = endMoment.diff(weekStart, 'minutes');
      weeks = addHoursToWeek(weeks, weekStart, duration, shift);
    }
  }
  return weeks;
}

// Utility to sort shifts object into order based on start of shift date/time
// Returns sorted object
function sortShifts(shifts) {
  return shifts.sort(function(a, b) {
    return moment(new Date(a[0])).isAfter(moment(new Date(b[0])));
  });
}

// Utility to count how many full days off are in a particular week
// Returns int of how many 24 hours off duty periods in week
function CountFullDaysOff(week) {
  var fullDaysOff = 0;
  var fullDayOff = 24 * 60;
  var sortedShifts = sortShifts(week.shifts);
  var length = sortedShifts.length;
  for (var i = 0; i < length; i++) {

    if ((i + 1) >= length) {
      break;
    }
    startMoment = moment(new Date(sortedShifts[i][1]));
    endMoment = moment(new Date(sortedShifts[i + 1][0]));
    if (endMoment.diff(startMoment, 'minutes') > fullDayOff) {
      fullDaysOff++;
    }
  }
  return fullDaysOff;
}

module.exports = Violations;
