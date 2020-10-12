import assert from 'assert';
import {
  convertHiddenOptions,
  correctTimeForHidden,
  getAccumulatedHiddenDuration,
  getHiddenDurationBefore,
  getHiddenDurationBeforeStart,
  getHiddenDurationBetween,
  getIsHidden,
  removeDuplicates,
  snapAwayFromHidden,
  stepOverHiddenDates,
  updateHiddenDates
} from '../lib/timeline/DateUtil';
import TimeStep from '../lib/timeline/TimeStep';
import moment from '../lib/module/moment';

describe('DateUtil', () => {
  describe('convertHiddenOptions', () => {
    let body;

    beforeEach(() => {
      body = {};
    });

    // it('should throw when passed invalid values', () => {
    //   assert.throws(() => convertHiddenOptions(moment, body, {
    //     start: 'lorem ipsum',
    //     end: '2014-03-28 00:00:00',
    //   }), new Error('Supplied start date is not valid: lorem ipsum'));
    //   assert.throws(() => convertHiddenOptions(moment, body, {
    //     start: '2014-03-21 00:00:00',
    //     end: 'dolor sit',
    //   }), new Error('Supplied end date is not valid: dolor sit'));
    // });

    it('should build hidden dates list (object)', () => {
      const data = {
        start: '2014-03-21 00:00:00',
        end: '2014-03-28 00:00:00',
      };
      const startDate = new Date(data.start).valueOf();
      const endDate = new Date(data.end).valueOf();

      convertHiddenOptions(moment, body, data);

      assert.strictEqual(body.hiddenDates.length, 1, 'should have correct number of items');
      assert.strictEqual(typeof body.hiddenDates[0].start, 'number', 'should convert string to number');
      assert.strictEqual(body.hiddenDates[0].start, startDate, 'timestamp value should match original date string');
      assert.strictEqual(typeof body.hiddenDates[0].end, 'number', 'should convert string to number');
      assert.strictEqual(body.hiddenDates[0].end, endDate, 'timestamp value should match original date string');
    });

    it('should build hidden dates list (array)', () => {
      const data = [
        {
          start: '2014-03-21 00:00:00',
          end: '2014-03-28 00:00:00',
        },
        {
          start: '2014-03-12 00:00:00',
          end: '2014-04-01 00:00:00',
        }
      ];
      const startDate1 = new Date(data[0].start).valueOf();
      const endDate1 = new Date(data[0].end).valueOf();
      const startDate2 = new Date(data[1].start).valueOf();
      const endDate2 = new Date(data[1].end).valueOf();

      convertHiddenOptions(moment, body, data);

      assert.strictEqual(body.hiddenDates.length, 2, 'should have correct number of items');
      assert.strictEqual(typeof body.hiddenDates[0].start, 'number', 'should convert string to number');
      assert.strictEqual(body.hiddenDates[0].start, startDate2, 'timestamp value should match original date string');
      assert.strictEqual(typeof body.hiddenDates[0].end, 'number', 'should convert string to number');
      assert.strictEqual(body.hiddenDates[0].end, endDate2, 'timestamp value should match original date string');
      assert.strictEqual(typeof body.hiddenDates[1].start, 'number', 'should convert string to number');
      assert.strictEqual(body.hiddenDates[1].start, startDate1, 'timestamp value should match original date string');
      assert.strictEqual(typeof body.hiddenDates[1].end, 'number', 'should convert string to number');
      assert.strictEqual(body.hiddenDates[1].end, endDate1, 'timestamp value should match original date string');
    });
  });

  describe('updateHiddenDates', () => {
    let body;

    beforeEach(() => {
      body = {};
    });

    it('should do nothing when `hiddenDates` param is null or undefined', () => {
      updateHiddenDates(moment, body, null);
      assert.strictEqual(Object.keys(body).length, 0, 'should be empty object');
      updateHiddenDates(moment, body, undefined);
      assert.strictEqual(Object.keys(body).length, 0, 'should be empty object');
    });

    // it('should do nothing when `body.domProps` is undefined or has missing props', () => {
    //   updateHiddenDates(moment, body, []);
    //   assert.strictEqual(Object.keys(body).length, 0, 'should be empty object');
    //   body.domProps = {};
    //   updateHiddenDates(moment, body, []);
    //   assert.strictEqual(Object.keys(body).length, 0, 'should be empty object');
    //   body.domProps.centerContainer = {};
    //   updateHiddenDates(moment, body, []);
    //   assert.strictEqual(Object.keys(body).length, 0, 'should be empty object');
    // });
  });

  describe('removeDuplicates', () => {
    let body;

    beforeEach(() => {
      body = {};
    });

    // it('should do nothing if `hiddenDates` prop is null, undefined, or empty array', () => {
    //   removeDuplicates(body);
    //   assert.strictEqual(body.hiddenDates, undefined, 'should be undefined');
    //   body.hiddenDates = [];
    //   removeDuplicates(body);
    //   assert.strictEqual(body.hiddenDates.length, 0, 'should be empty array');
    // });

    it('should remove dates that are within a single date range', () => {
      body.hiddenDates = [
        {
          start: new Date(2020, 9, 1).valueOf(),
          end: new Date(2020, 9, 11).valueOf()
        },
        {
          start: new Date(2020, 9, 2).valueOf(),
          end: new Date(2020, 9, 5).valueOf()
        }
      ];
      removeDuplicates(body);
      assert.strictEqual(body.hiddenDates.length, 1, 'should have correct number of items');
      assert.strictEqual(body.hiddenDates[0].start.valueOf(), new Date(2020, 9, 1).valueOf(), 'should be outer most start Date');
      assert.strictEqual(body.hiddenDates[0].end.valueOf(), new Date(2020, 9, 11).valueOf(), 'should be outer most end Date');
    });

    it('should remove overlapping dates', () => {
      body.hiddenDates = [
        {
          start: new Date(2020, 9, 1).valueOf(),
          end: new Date(2020, 9, 11).valueOf()
        },
        {
          start: new Date(2020, 9, 2).valueOf(),
          end: new Date(2020, 9, 15).valueOf()
        },
        {
          start: new Date(2020, 8, 28).valueOf(),
          end: new Date(2020, 9, 5).valueOf()
        }
      ];
      removeDuplicates(body);
      assert.strictEqual(body.hiddenDates.length, 1, 'should have correct number of items');
      assert.strictEqual(body.hiddenDates[0].start.valueOf(), new Date(2020, 8, 28).valueOf(), 'should be outer most start Date');
      assert.strictEqual(body.hiddenDates[0].end.valueOf(), new Date(2020, 9, 15).valueOf(), 'should be outer most end Date');
    });

    it('should remove overlapping dates (multiple)', () => {
      body.hiddenDates = [
        {
          start: new Date(2020, 9, 1).valueOf(),
          end: new Date(2020, 9, 11).valueOf()
        },
        {
          start: new Date(2020, 9, 2).valueOf(),
          end: new Date(2020, 9, 15).valueOf()
        },
        {
          start: new Date(2020, 8, 28).valueOf(),
          end: new Date(2020, 9, 5).valueOf()
        },
        {
          start: new Date(2020, 5, 1).valueOf(),
          end: new Date(2020, 5, 30).valueOf()
        },
        {
          start: new Date(2020, 5, 1).valueOf(),
          end: new Date(2020, 6, 5).valueOf()
        }
      ];
      removeDuplicates(body);
      assert.strictEqual(2, body.hiddenDates.length, 'should have correct number of items');
      assert.strictEqual(body.hiddenDates[0].start.valueOf(), new Date(2020, 5, 1).valueOf(), 'should be outer most start Date');
      assert.strictEqual(body.hiddenDates[0].end.valueOf(), new Date(2020, 6, 5).valueOf(), 'should be outer most end Date');
      assert.strictEqual(body.hiddenDates[1].start.valueOf(), new Date(2020, 8, 28).valueOf(), 'should be outer most start Date');
      assert.strictEqual(body.hiddenDates[1].end.valueOf(), new Date(2020, 9, 15).valueOf(), 'should be outer most end Date');
    });
  });

  describe('stepOverHiddenDates', () => {
    it('should do nothing when no hiddenDates', () => {
      const timestep = new TimeStep(new Date(2020, 9, 1), new Date(2020, 9, 30));
      timestep.current = new Date(2020, 9, 11, 0, 0, 0, 0);
      stepOverHiddenDates(moment, timestep);
      assert.strictEqual(timestep.current.valueOf(), new Date(2020, 9, 11, 0, 0, 0, 0).valueOf(), 'should match original Date');
    });

    it('should do nothing if currentTime is not within hiddenDates', () => {
      const timestep = new TimeStep(new Date(2020, 9, 1), new Date(2020, 9, 30));
      timestep.current = new Date(2020, 9, 11, 0, 0, 0, 0);
      timestep.hiddenDates = [
        {
          start: new Date(2020, 8, 1).valueOf(),
          end: new Date(2020, 8, 30).valueOf()
        }
      ];
      stepOverHiddenDates(moment, timestep);
      assert.strictEqual(timestep.current.valueOf(), new Date(2020, 9, 11, 0, 0, 0, 0).valueOf(), 'should match original Date');
    });

    it('should update currentTime to the end Date of the hidden Date it is in', () => {
      const timestep = new TimeStep(new Date(2020, 9, 1), new Date(2020, 9, 30));
      timestep.hiddenDates = [
        {
          start: new Date(2019, 11, 1).valueOf(),
          end: new Date(2020, 0, 31).valueOf()
        },
        {
          start: new Date(2020, 8, 15).valueOf(),
          end: new Date(2020, 9, 30).valueOf()
        }
      ];
      timestep.current = new Date(2019, 11, 15, 0, 0, 0, 0);
      stepOverHiddenDates(moment, timestep, new Date(2019, 11, 10));
      assert.strictEqual(timestep.current.valueOf(), new Date(2020, 0, 31, 0, 0, 0, 0).valueOf(),'should have updated currentTime value');
      assert.strictEqual(timestep.switchedYear, true, 'should have updated relevant flag (year)');

      timestep.current = new Date(2020, 8, 30, 0, 0, 0, 0);
      stepOverHiddenDates(moment, timestep, new Date(2020, 8, 10));
      assert.strictEqual(timestep.current.valueOf(), new Date(2020, 9, 30, 0, 0, 0, 0).valueOf(), 'should have updated currentTime value');
      assert.strictEqual(timestep.switchedMonth, true, 'should have updated relevant flag (month)');

      timestep.current = new Date(2020, 9, 29, 0, 0, 0, 0);
      stepOverHiddenDates(moment, timestep, new Date(2020, 9, 10));
      assert.strictEqual(timestep.current.valueOf(), new Date(2020, 9, 30, 0, 0, 0, 0).valueOf(), 'should have updated currentTime value');
      assert.strictEqual(timestep.switchedDay, true, 'should have updated relevant flag (day)');
    });
  });

  describe('getHiddenDurationBetween', () => {
    it('should return zero when hiddenDates is empty array', () => {
      assert.strictEqual(0, getHiddenDurationBetween([], new Date(2020, 9, 1), new Date(2020, 9, 10)), 'should be zero');
    });

    it('should return total duration in milliseconds within hiddenDates between given start and end times', () => {
      const hiddenDates = [
        {
          start: new Date(2020, 9, 5, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 6, 0, 0, 0, 0).valueOf()
        },
        {
          start: new Date(2020, 9, 5, 12, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 6, 0, 0, 0, 0).valueOf()
        }
      ];
      assert.strictEqual(getHiddenDurationBetween(hiddenDates, new Date(2020, 9, 1), new Date(2020, 9, 2)), 0, 'should be total duration in milliseconds');
      assert.strictEqual(getHiddenDurationBetween(hiddenDates, new Date(2020, 9, 1), new Date(2020, 9, 10)), 129600000, 'should be total duration in milliseconds');
      assert.strictEqual(getHiddenDurationBetween(hiddenDates, new Date(2020, 9, 1), new Date(2020, 9, 6, 0, 0, 0, 0)), 0, 'should be total duration in milliseconds');
    });
  });

  describe('getHiddenDurationBeforeStart', () => {
    it('should return zero when hiddenDates is empty array', () => {
      assert.strictEqual(0, getHiddenDurationBeforeStart([], new Date(2020, 9, 1), new Date(2020, 9, 10)), 'should be zero');
    });

    it('should return total duration in milliseconds within hiddenDates between given start and end times', () => {
      const hiddenDates = [
        {
          start: new Date(2020, 9, 5, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 6, 0, 0, 0, 0).valueOf()
        },
        {
          start: new Date(2020, 9, 5, 12, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 6, 0, 0, 0, 0).valueOf()
        }
      ];
      assert.strictEqual(getHiddenDurationBeforeStart(hiddenDates, new Date(2020, 9, 1), new Date(2020, 9, 2)), 0, 'should be total duration in milliseconds');
      assert.strictEqual(getHiddenDurationBeforeStart(hiddenDates, new Date(2020, 9, 1), new Date(2020, 9, 10)), 129600000, 'should be total duration in milliseconds');
      assert.strictEqual(getHiddenDurationBeforeStart(hiddenDates, new Date(2020, 9, 1), new Date(2020, 9, 6, 0, 0, 0, 0)), 129600000, 'should be total duration in milliseconds');
    });
  });

  describe('correctTimeForHidden', () => {
    it('should return given time when hiddenDates is empty array', () => {
      const now = new Date(2020, 9, 12, 0, 0, 0, 0);
      assert.strictEqual(correctTimeForHidden(moment, [], { start: new Date(2020, 9, 1), end: new Date(2020, 9, 30) }, now).valueOf(), now.valueOf(), 'should not have changed');
    });

    it('should return correct given time', () => {
      const hiddenDates = [
        {
          start: new Date(2020, 9, 5, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 6, 0, 0, 0, 0).valueOf()
        },
        {
          start: new Date(2020, 9, 7, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 8, 0, 0, 0, 0).valueOf()
        }
      ];
      assert.strictEqual(
        correctTimeForHidden(moment, hiddenDates, {
          start: new Date(2020, 9, 1),
          end: new Date(2020, 9, 30)
        }, new Date(2020, 9, 12, 0, 0, 0, 0)).valueOf(), new Date(2020, 9, 10).valueOf(), 'should have been corrected');
    });
  });

  describe('getHiddenDurationBefore', () => {
    it('should return zero when hiddenDates is empty array', () => {
      assert.strictEqual(getHiddenDurationBefore(moment, [], new Date(2020, 9, 1), new Date(2020, 9, 10)), 0, 'should be zero');
    });

    it('should return total duration in milliseconds within hiddenDates between given start and end times', () => {
      const hiddenDates = [
        {
          start: new Date(2020, 9, 5, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 6, 0, 0, 0, 0).valueOf()
        },
        {
          start: new Date(2020, 9, 5, 12, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 6, 0, 0, 0, 0).valueOf()
        }
      ];
      assert.strictEqual(getHiddenDurationBefore(moment, hiddenDates, { start: new Date(2020, 9, 1), end: new Date(2020, 9, 2) }), 0, 'should be total duration in milliseconds');
      assert.strictEqual(getHiddenDurationBefore(moment, hiddenDates, { start: new Date(2020, 9, 1), end: new Date(2020, 9, 10) }, new Date(2020, 9, 10)), 129600000, 'should be total duration in milliseconds');
      assert.strictEqual(getHiddenDurationBefore(moment, hiddenDates, { start: new Date(2020, 9, 1), end: new Date(2020, 9, 6, 0, 0, 0, 0) }, new Date(2020, 9, 10)), 0, 'should be total duration in milliseconds');
    });
  });

  describe('getAccumulatedHiddenDuration', () => {
    // it('should return zero when invalid input values', () => {
    //   assert.strictEqual(getAccumulatedHiddenDuration([], null), 0, 'should be zero');
    // });

    it('should return zero when hiddenDates is empty array', () => {
      assert.strictEqual(getAccumulatedHiddenDuration([], { start: new Date(2020, 9, 5), end: new Date(2020, 9, 6) }), 0, 'should be zero');
    });

    it('should return total hidden duration between given range', () => {
      const hiddenDates = [
        {
          start: new Date(2020, 9, 5, 0, 0, 0, 0),
          end: new Date(2020, 9, 6, 0, 0, 0, 0)
        },
        {
          start: new Date(2020, 9, 7, 0, 0, 0, 0),
          end: new Date(2020, 9, 7, 12, 0, 0, 0)
        }
      ];
      assert.strictEqual(getAccumulatedHiddenDuration(hiddenDates, { start: new Date(2020, 9, 1, 0, 0, 0, 0), end: new Date(2020, 9, 10, 0, 0, 0, 0) }), 129600000, 'should be total hidden duration in milliseconds');
    });

    it('should return total hidden duration between given range until required duration is exceeded', () => {
      const hiddenDates = [
        {
          start: new Date(2020, 9, 5, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 6, 0, 0, 0, 0).valueOf()
        },
        {
          start: new Date(2020, 9, 7, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 7, 12, 0, 0, 0).valueOf()
        }
      ];
      assert.strictEqual(getAccumulatedHiddenDuration(hiddenDates, { start: new Date(2020, 9, 1, 0, 0, 0, 0), end: new Date(2020, 9, 10, 0, 0, 0, 0) }, 86400000), 0, 'should be total hidden duration in milliseconds');
      assert.strictEqual(getAccumulatedHiddenDuration(hiddenDates, { start: new Date(2020, 9, 5, 0, 0, 0, 0), end: new Date(2020, 9, 7, 0, 0, 0, 0) }, 86400000), 86400000, 'should be total hidden duration in milliseconds');
    });
  });

  describe('snapAwayFromHidden', () => {
    it('should return change given time when hidden is false', () => {
      const now = new Date(2020, 9, 1, 0, 0, 0, 0);
      const hiddenDates = [
        {
          start: new Date(2020, 9, 5, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 6, 0, 0, 0, 0).valueOf()
        },
        {
          start: new Date(2020, 9, 7, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 7, 12, 0, 0, 0).valueOf()
        }
      ];
      assert.strictEqual(snapAwayFromHidden(hiddenDates, now, 0, false).valueOf(), now.valueOf(), 'should equal input date');
    });

    it('should return time before/after a hidden date', () => {
      const hiddenDates = [
        {
          start: new Date(2020, 9, 5, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 6, 0, 0, 0, 0).valueOf()
        },
        {
          start: new Date(2020, 9, 7, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 7, 12, 0, 0, 0).valueOf()
        }
      ];
      assert.strictEqual(snapAwayFromHidden(hiddenDates, new Date(2020, 9, 5, 12, 0, 0, 0), 0, false).valueOf(), new Date(2020, 9, 6, 0, 0, 0, 1).valueOf(), 'should be after a hidden date');
      assert.strictEqual(snapAwayFromHidden(hiddenDates, new Date(2020, 9, 5, 12, 0, 0, 0), -1, false).valueOf(), new Date(2020, 9, 4, 23, 59, 59, 999).valueOf(), 'should be before a hidden date');
    });

    it('should return corrected date', () => {
      const hiddenDates = [
        {
          start: new Date(2020, 9, 5, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 6, 0, 0, 0, 0).valueOf()
        },
        {
          start: new Date(2020, 9, 7, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 7, 12, 0, 0, 0).valueOf()
        }
      ];
      assert.strictEqual(snapAwayFromHidden(hiddenDates, new Date(2020, 9, 5, 12, 0, 0, 0), 0, true).valueOf(), new Date(2020, 9, 6, 12, 0, 0, 1).valueOf(), 'should be after a hidden date');
      assert.strictEqual(snapAwayFromHidden(hiddenDates, new Date(2020, 9, 5, 12, 0, 0, 0), -1, true).valueOf(), new Date(2020, 9, 4, 11, 59, 59, 999).valueOf(), 'should be before a hidden date');
    });
  });

  describe('getIsHidden', () => {
    it('should return the hidden date that the given time is within along with the correct hidden flag', () => {
      const hiddenDates = [
        {
          start: new Date(2020, 9, 5, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 6, 0, 0, 0, 0).valueOf()
        },
        {
          start: new Date(2020, 9, 7, 0, 0, 0, 0).valueOf(),
          end: new Date(2020, 9, 7, 12, 0, 0, 0).valueOf()
        }
      ];

      const result1 = getIsHidden(new Date(2020, 9, 1), hiddenDates);
      assert.strictEqual(result1.startDate.valueOf(), new Date(2020, 9, 7, 0, 0, 0, 0).valueOf());
      assert.strictEqual(result1.endDate.valueOf(), new Date(2020, 9, 7, 12, 0, 0, 0).valueOf());
      assert.strictEqual(result1.hidden, false);

      const result2 = getIsHidden(new Date(2020, 9, 5), hiddenDates);
      assert.strictEqual(result2.startDate.valueOf(), new Date(2020, 9, 5, 0, 0, 0, 0).valueOf());
      assert.strictEqual(result2.endDate.valueOf(), new Date(2020, 9, 6, 0, 0, 0, 0).valueOf());
      assert.strictEqual(result2.hidden, true);
    });
  });
});