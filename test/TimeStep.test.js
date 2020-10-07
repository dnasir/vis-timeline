import assert from 'assert'
import jsdom_global from 'jsdom-global'
import TimeStep from '../lib/timeline/TimeStep'
import parseISO from 'date-fns/parseISO'
import getUnixTime from 'date-fns/getUnixTime'

const internals = {}

describe('TimeStep', () => {
  
  before(() => {
    internals.jsdom_global = jsdom_global();
  });

  after(() => {
      internals.jsdom_global();
  });

  it('should work with just start and end dates', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5));
    assert.equal(timestep.autoScale, true, "should autoscale if scale not specified");
    assert.equal(timestep.scale, "day", "should default to day scale if scale not specified");
    assert.equal(timestep.step, 1, "should default to 1 day step if scale not specified");
  });

  it('should work with specified scale (just under 1 second)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5), 999);
    assert.equal(timestep.scale, "second", "should have right scale");
    assert.equal(timestep.step, 1, "should have right step size");
  });

  // TODO: check internals - maybe should work for 1000?
  it('should work with specified scale (1 second)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5), 1001);
    assert.equal(timestep.scale, "second", "should have right scale");
    assert.equal(timestep.step, 5, "should have right step size");
  });

  it('should work with specified scale (2 seconds)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5), 2000);
    assert.equal(timestep.scale, "second", "should have right scale");
    assert.equal(timestep.step, 5, "should have right step size");
  });

  it('should work with specified scale (5 seconds)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5), 5001);
    assert.equal(timestep.scale, "second", "should have right scale");
    assert.equal(timestep.step, 10, "should have right step size");
  });

  it('should perform the step with a specified scale (1 year)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5));
    timestep.setScale({ scale: 'year', step: 1 });
    timestep.start();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-01-01T00:00:00.000")), "should have the right initial value");
    timestep.next();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2018-01-01T00:00:00.000")), "should have the right value after a step");
  });

  it('should perform the step with a specified scale (1 month)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5));
    timestep.setScale({ scale: 'month', step: 1 });
    timestep.start();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-01T00:00:00.000")), "should have the right initial value");
    timestep.next();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-05-01T00:00:00.000")), "should have the right value after a step");
  });

  it('should perform the step with a specified scale (1 week)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5));
    timestep.setScale({ scale: 'week', step: 1 });
    timestep.start();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-02T00:00:00.000")), "should have the right initial value");
    timestep.next();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-09T00:00:00.000")), "should have the right value after a step");
  });

  it('should perform the step with a specified scale (1 day)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5));
    timestep.setScale({ scale: 'day', step: 1 });
    timestep.start();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-03T00:00:00.000")), "should have the right initial value");
    timestep.next();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-04T00:00:00.000")), "should have the right value after a step");
  });

  it('should perform the step with a specified scale (1 hour)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5));
    timestep.setScale({ scale: 'hour', step: 1 });
    timestep.start();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-03T00:00:00.000")), "should have the right initial value");
    timestep.next();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-03T01:00:00.000")), "should have the right value after a step");
    timestep.setScale({ scale: 'hour', step: 2 });
    timestep.next();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-03T03:00:00.000")), "should have the right value after a step (step=2)");
    timestep.next();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-03T05:00:00.000")), "should have the right value after a step (step=2)");
  });

  it('should perform the step with a specified scale (1 minute)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5));
    timestep.setScale({ scale: 'minute', step: 1 });
    timestep.start();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-03T00:00:00.000")), "should have the right initial value");
    timestep.next();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-03T00:01:00.000")), "should have the right value after a step");
    timestep.setScale({ scale: 'minute', step: 2 });
    timestep.next();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-03T00:03:00.000")), "should have the right value after a step (step=2)");
    timestep.next();
    assert.equal(getUnixTime(timestep.getCurrent()), getUnixTime(parseISO("2017-04-03T00:05:00.000")), "should have the right value after a step (step=2)");
  });

  describe('isMajor', () => {
    it('should correctly identify major value (month)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.current = new Date(2017, 0, 1);
      timestep.setScale({ scale: 'month', step: 1 });
      assert.equal(timestep.isMajor(), true, 'should be major value');
    });

    it('should correctly identify major value (day)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.current = new Date(2017, 10, 1);
      timestep.setScale({ scale: 'day', step: 1 });
      assert.equal(timestep.isMajor(), true, 'should be major value');
    });

    it('should correctly identify major value (hour)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.current = new Date(2017, 10, 1, 0);
      timestep.setScale({ scale: 'hour', step: 1 });
      assert.equal(timestep.isMajor(), true, 'should be major value');
    });

    it('should correctly identify major value (minute)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.current = new Date(2017, 10, 1, 13, 0);
      timestep.setScale({ scale: 'minute', step: 1 });
      assert.equal(timestep.isMajor(), true, 'should be major value');
    });

    it('should correctly identify major value (second)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.current = new Date(2017, 10, 1, 13, 50, 0);
      timestep.setScale({ scale: 'second', step: 1 });
      assert.equal(timestep.isMajor(), true, 'should be major value');
    });

    it('should correctly identify major value (millisecond)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.current = new Date(2017, 10, 1, 13, 50, 25, 0);
      timestep.setScale({ scale: 'millisecond', step: 1 });
      assert.equal(timestep.isMajor(), true, 'should be major value');
    });
  });

  describe('getLabelMinor', () => {
    it('should return the correct minor label (year)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'year', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1)), '2017', 'should be correct minor label');
    });
    it('should return the correct minor label (month)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'month', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1)), 'Apr', 'should be correct minor label');
    });
    it('should return the correct minor label (week)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'week', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1)), '', 'should be empty for 1st day of the month that is not the first day of the week');
      assert.equal(timestep.getLabelMinor(new Date(2017, 0, 1)), '1', 'should be correct minor label');
    });
    it('should return the correct minor label (day)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'day', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1)), '1', 'should be correct minor label');
    });
    it('should return the correct minor label (weekday)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'weekday', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1)), 'Sat 1', 'should be correct minor label');
    });
    it('should return the correct minor label (hour)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'hour', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1, 12, 45)), '12:45', 'should be correct minor label');
    });
    it('should return the correct minor label (minute)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'minute', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1, 12, 45)), '12:45', 'should be correct minor label');
    });
    it('should return the correct minor label (second)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'second', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1, 12, 45, 35)), '35', 'should be correct minor label');
    });
    it('should return the correct minor label (millisecond)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'millisecond', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1, 12, 45, 35, 123)), '123', 'should be correct minor label');
    });
  });

  describe('getLabelMajor', () => {
    it('should return the correct major label (year)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'year', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1)), '', 'should be correct major label');
    });
    it('should return the correct major label (month)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'month', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1)), '2017', 'should be correct major label');
    });
    it('should return the correct major label (week)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'week', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1)), 'April 2017', 'should be correct major label');
    });
    it('should return the correct major label (day)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'day', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1)), 'April 2017', 'should be correct major label');
    });
    it('should return the correct major label (weekday)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'day', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1)), 'April 2017', 'should be correct major label');
    });
    it('should return the correct major label (hour)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'hour', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1, 12, 45)), 'Sat 1 April', 'should be correct major label');
    });
    it('should return the correct major label (minute)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'minute', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1, 12, 45)), 'Sat 1 April', 'should be correct major label');
    });
    it('should return the correct major label (second)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'second', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1, 12, 45, 35)), '1 April 12:45', 'should be correct major label');
    });
    it('should return the correct major label (millisecond)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'millisecond', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1, 12, 45, 35, 123)), '12:45:35', 'should be correct major label');
    });
  });

  describe('getClassName', () => {
    let originalDateNow;

    beforeEach(() => {
      originalDateNow = Date.now;
      Date.now = mockDateNow;
    });
    afterEach(() => {
      Date.now = originalDateNow;
    });

    it('should return the correct class name (year)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'year', step: 1 });
      timestep.current = new Date(2017, 3, 1);
      assert.equal(timestep.getClassName(), 'vis-year2017 vis-odd', 'should be correct class name');
      timestep.current = new Date(2020, 3, 1);
      assert.equal(timestep.getClassName(), 'vis-year2020 vis-current-year vis-even', 'should be correct class name');
    });
    it('should return the correct class name (month)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'month', step: 1 });
      timestep.current = new Date(2017, 3, 1);
      assert.equal(timestep.getClassName(), 'vis-april vis-odd', 'should be correct class name');
      timestep.current = new Date(2020, 9, 1);
      assert.equal(timestep.getClassName(), 'vis-october vis-current-month vis-odd', 'should be correct class name');
    });
    it('should return the correct class name (week)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'week', step: 1 });
      timestep.current = new Date(2017, 3, 1);
      assert.equal(timestep.getClassName(), 'vis-week13 vis-odd', 'should be correct class name');
      timestep.current = new Date(2020, 9, 5);
      assert.equal(timestep.getClassName(), 'vis-week41 vis-current-week vis-odd', 'should be correct class name');
    });
    it('should return the correct class name (day)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'day', step: 1 });
      timestep.current = new Date(2017, 3, 1);
      assert.equal(timestep.getClassName(), 'vis-day1 vis-april vis-saturday vis-even', 'should be correct class name');
      timestep.current = new Date(2020, 9, 7);
      assert.equal(timestep.getClassName(), 'vis-day7 vis-october vis-current-month vis-today vis-wednesday vis-even', 'should be correct class name');
    });
    it('should return the correct class name (weekday)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'weekday', step: 1 });
      timestep.current = new Date(2017, 3, 1);
      assert.equal(timestep.getClassName(), 'vis-saturday vis-odd', 'should be correct class name');
      timestep.current = new Date(2020, 9, 7);
      assert.equal(timestep.getClassName(), 'vis-wednesday vis-today vis-current-week vis-odd', 'should be correct class name');
    });
    it('should return the correct class name (hour)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'hour', step: 1 });
      timestep.current = new Date(2017, 3, 1, 12, 45);
      assert.equal(timestep.getClassName(), 'vis-h12 vis-even', 'should be correct class name');
      timestep.current = new Date(2020, 9, 7, 12, 45);
      assert.equal(timestep.getClassName(), 'vis-h12 vis-today vis-even', 'should be correct class name');
      timestep.setScale({ scale: 'hour', step: 4 });
      timestep.current = new Date(2017, 3, 1, 12, 45);
      assert.equal(timestep.getClassName(), 'vis-h12-h16 vis-odd', 'should handle special case for step=4');
      timestep.current = new Date(2020, 9, 7, 12, 45);
      assert.equal(timestep.getClassName(), 'vis-h12-h16 vis-today vis-odd', 'should handle special case for step=4');
    });
    it('should return the correct class name (minute)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'minute', step: 1 });
      timestep.current = new Date(2017, 3, 1, 12, 45);
      assert.equal(timestep.getClassName(), 'vis-odd', 'should be correct class name');
      timestep.current = new Date(2020, 9, 7, 12, 45);
      assert.equal(timestep.getClassName(), 'vis-today vis-odd', 'should be correct class name');
    });
    it('should return the correct class name (second)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'second', step: 1 });
      timestep.current = new Date(2017, 3, 1, 12, 45, 35);
      assert.equal(timestep.getClassName(), 'vis-odd', 'should be correct class name');
      timestep.current = new Date(2020, 9, 7, 12, 45, 35);
      assert.equal(timestep.getClassName(), 'vis-today vis-odd', 'should be correct class name');
    });
    it('should return the correct class name (millisecond)', () => {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'millisecond', step: 1 });
      timestep.current = new Date(2017, 3, 1, 12, 4, 35, 300);
      assert.equal(timestep.getClassName(), 'vis-even', 'should be correct class name');
      timestep.current = new Date(2020, 9, 7, 12, 45, 35, 300);
      assert.equal(timestep.getClassName(), 'vis-today vis-even', 'should be correct class name');
    });
  });
});

// eslint-disable-next-line require-jsdoc
function mockDateNow() {
  return 1602054000000; // 2020-10-07T07:00:00.000Z
}