import assert from 'assert'
import jsdom_global from 'jsdom-global'
import TimeStep from '../lib/timeline/TimeStep'
import mockery from 'mockery';

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
    assert.equal(timestep.getCurrent().valueOf(), new Date(2017, 0, 1, 0, 0, 0, 0).valueOf(), "should have the right initial value");
    timestep.next();
    assert.equal(timestep.getCurrent().valueOf(), new Date(2018, 0, 1, 0, 0, 0, 0).valueOf(), "should have the right value after a step");
  });

  it('should perform the step with a specified scale (1 month)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5));
    timestep.setScale({ scale: 'month', step: 1 });
    timestep.start();
    assert.equal(timestep.getCurrent().valueOf(), new Date(2017, 3, 1, 0, 0, 0, 0).valueOf(), "should have the right initial value");
    timestep.next();
    assert.equal(timestep.getCurrent().valueOf(), new Date(2017, 4, 1, 0, 0, 0, 0).valueOf(), "should have the right value after a step");
  });

  it('should perform the step with a specified scale (1 week)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5));
    timestep.setScale({ scale: 'week', step: 1 });
    timestep.start();
    assert.equal(timestep.getCurrent().valueOf(), new Date(2017, 3, 2, 0, 0, 0, 0).valueOf(), "should have the right initial value");
    timestep.next();
    assert.equal(timestep.getCurrent().valueOf(), new Date(2017, 3, 9, 0, 0, 0, 0).valueOf(), "should have the right value after a step");
  });

  it('should perform the step with a specified scale (1 day)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5));
    timestep.setScale({ scale: 'day', step: 1 });
    timestep.start();
    assert.equal(timestep.getCurrent().valueOf(), new Date(2017, 3, 3, 0, 0, 0, 0).valueOf(), "should have the right initial value");
    timestep.next();
    assert.equal(timestep.getCurrent().valueOf(), new Date(2017, 3, 4, 0, 0, 0, 0).valueOf(), "should have the right value after a step");
  });

  it('should perform the step with a specified scale (1 hour)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5));
    timestep.setScale({ scale: 'hour', step: 1 });
    timestep.start();
    assert.equal(timestep.getCurrent().valueOf(), new Date(2017, 3, 3, 0, 0, 0, 0).valueOf(), "should have the right initial value");
    timestep.next();
    assert.equal(timestep.getCurrent().valueOf(), new Date(2017, 3, 3, 1, 0, 0, 0).valueOf(), "should have the right value after a step");
  });

  it('should perform the step with a specified scale (1 minute)', () => {
    const timestep = new TimeStep(new Date(2017, 3, 3), new Date(2017, 3, 5));
    timestep.setScale({ scale: 'minute', step: 1 });
    timestep.start();
    assert.strictEqual(timestep.getCurrent().valueOf(), new Date(2017, 3, 3, 0, 0, 0, 0).valueOf(), "should have the right initial value");
    timestep.next();
    assert.strictEqual(timestep.getCurrent().valueOf(), new Date(2017, 3, 3, 0, 1, 0, 0).valueOf(), "should have the right value after a step");
    timestep.setScale({ scale: 'minute', step: 2 });
    timestep.next();
    assert.strictEqual(timestep.getCurrent().valueOf(), new Date(2017, 3, 3, 0, 3, 0, 0).valueOf(), "should have the right value after a step (step=2)");
    timestep.next();
    assert.strictEqual(timestep.getCurrent().valueOf(), new Date(2017, 3, 3, 0, 5, 0, 0).valueOf(), "should have the right value after a step (step=2)");
  });

  describe.only('snap', function() {
    it('should snap to closest rounded value (year)', function() {
      assert.strictEqual(TimeStep.snap(new Date(2020, 3, 3), 'year', 1).valueOf(), new Date(2020, 0, 1).valueOf(), "should have snapped to the beginning of current year");
      assert.strictEqual(TimeStep.snap(new Date(2020, 8, 3), 'year', 1).valueOf(), new Date(2021, 0, 1).valueOf(), "should have snapped to the beginning of next year");
      assert.strictEqual(TimeStep.snap(new Date(2020, 3, 3), 'year', 2).valueOf(), new Date(2020, 0, 1).valueOf(), "should have snapped to the beginning of current year (step=2)");
      assert.strictEqual(TimeStep.snap(new Date(2020, 8, 3), 'year', 2).valueOf(), new Date(2022, 0, 1).valueOf(), "should have snapped to the beginning of next year (step=2)");
      assert.strictEqual(TimeStep.snap(new Date(2020, 3, 3), 'year', 3).valueOf(), new Date(2020, 0, 1).valueOf(), "should have snapped to the beginning of current year (step=3)");
      assert.strictEqual(TimeStep.snap(new Date(2020, 8, 3), 'year', 3).valueOf(), new Date(2023, 0, 1).valueOf(), "should have snapped to the beginning of next year (step=3)");
    });

    it('should snap to closest rounded value (month)', function() {
      assert.strictEqual(TimeStep.snap(new Date(2020, 3, 3), 'month', 1).valueOf(), new Date(2020, 3, 1).valueOf(), "should have snapped to the beginning of current month");
      assert.strictEqual(TimeStep.snap(new Date(2020, 3, 23), 'month', 1).valueOf(), new Date(2020, 4, 1).valueOf(), "should have snapped to the beginning of next month");
      // assert.strictEqual(TimeStep.snap(new Date(2020, 3, 3), 'month', 2).valueOf(), new Date(2020, 3, 1).valueOf(), "should have snapped to the beginning of current month (step=2)");
      // assert.strictEqual(TimeStep.snap(new Date(2020, 3, 23), 'month', 2).valueOf(), new Date(2020, 5, 1).valueOf(), "should have snapped to the beginning of next month (step=2)");
      // assert.strictEqual(TimeStep.snap(new Date(2020, 3, 3), 'month', 3).valueOf(), new Date(2020, 3, 1).valueOf(), "should have snapped to the beginning of current month (step=3)");
      // assert.strictEqual(TimeStep.snap(new Date(2020, 3, 23), 'month', 3).valueOf(), new Date(2020, 6, 1).valueOf(), "should have snapped to the beginning of next month (step=3)");
    });

    it('should snap to closest rounded value (week)', function() {
      assert.strictEqual(TimeStep.snap(new Date(2020, 2, 31), 'week', 1).valueOf(), new Date(2020, 2, 29).valueOf(), "should have snapped to the beginning of current week");
      assert.strictEqual(TimeStep.snap(new Date(2020, 3, 1), 'week', 1).valueOf(), new Date(2020, 3, 5).valueOf(), "should have snapped to the beginning of next week");
      // assert.strictEqual(TimeStep.snap(new Date(2020, 2, 31), 'week', 2).valueOf(), new Date(2020, 2, 29).valueOf(), "should have snapped to the beginning of current week (step=2)");
      // assert.strictEqual(TimeStep.snap(new Date(2020, 3, 1), 'week', 2).valueOf(), new Date(2020, 3, 12).valueOf(), "should have snapped to the beginning of next week (step=2)");
      // assert.strictEqual(TimeStep.snap(new Date(2020, 2, 31), 'week', 3).valueOf(), new Date(2020, 2, 29).valueOf(), "should have snapped to the beginning of current week (step=3)");
      // assert.strictEqual(TimeStep.snap(new Date(2020, 3, 1), 'week', 3).valueOf(), new Date(2020, 3, 19).valueOf(), "should have snapped to the beginning of next week (step=3)");
    });

    it('should snap to closest rounded value (day)', function() {
      assert.strictEqual(TimeStep.snap(new Date(2020, 3, 3, 6), 'day', 1).valueOf(), new Date(2020, 3, 3, 12).valueOf(), "should have snapped to the beginning of current day");
      assert.strictEqual(TimeStep.snap(new Date(2020, 3, 3, 18), 'day', 1).valueOf(), new Date(2020, 3, 4).valueOf(), "should have snapped to the beginning of next day");
      assert.strictEqual(TimeStep.snap(new Date(2020, 3, 3, 6), 'day', 2).valueOf(), new Date(2020, 3, 3).valueOf(), "should have snapped to the beginning of current day (step=2)");
      assert.strictEqual(TimeStep.snap(new Date(2020, 3, 3, 18), 'day', 2).valueOf(), new Date(2020, 3, 4).valueOf(), "should have snapped to the beginning of next day (step=2)");
      assert.strictEqual(TimeStep.snap(new Date(2020, 3, 3, 6), 'day', 3).valueOf(), new Date(2020, 3, 3, 12).valueOf(), "should have snapped to the beginning of current day (step=3)");
      assert.strictEqual(TimeStep.snap(new Date(2020, 3, 3, 18), 'day', 3).valueOf(), new Date(2020, 3, 4).valueOf(), "should have snapped to the beginning of next day (step=3)");
    });
  });

  describe('isMajor', function () {
    it('should correctly identify major value (month)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.current = new Date(2017, 0, 1);
      timestep.setScale({ scale: 'month', step: 1 });
      assert.strictEqual(timestep.isMajor(), true, 'should be major value');
    });

    it('should correctly identify major value (day)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.current = new Date(2017, 10, 1);
      timestep.setScale({ scale: 'day', step: 1 });
      assert.strictEqual(timestep.isMajor(), true, 'should be major value');
    });

    it('should correctly identify major value (hour)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.current = new Date(2017, 10, 1, 0);
      timestep.setScale({ scale: 'hour', step: 1 });
      assert.strictEqual(timestep.isMajor(), true, 'should be major value');
    });

    it('should correctly identify major value (minute)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.current = new Date(2017, 10, 1, 0, 0);
      timestep.setScale({ scale: 'minute', step: 1 });
      assert.strictEqual(timestep.isMajor(), true, 'should be major value');
    });

    it('should correctly identify major value (second)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.current = new Date(2017, 10, 1, 13, 50, 0);
      timestep.setScale({ scale: 'second', step: 1 });
      assert.strictEqual(timestep.isMajor(), true, 'should be major value');
    });

    it('should correctly identify major value (millisecond)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.current = new Date(2017, 10, 1, 13, 50, 25, 0);
      timestep.setScale({ scale: 'millisecond', step: 1 });
      assert.strictEqual(timestep.isMajor(), true, 'should be major value');
    });
  });

  describe('getLabelMinor', function () {
    it('should return the correct minor label (year)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'year', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1)), '2017', 'should be correct minor label');
    });
    it('should return the correct minor label (month)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'month', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1)), 'Apr', 'should be correct minor label');
    });
    it('should return the correct minor label (week)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'week', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1)), '', 'should be empty for 1st day of the month that is not the first day of the week');
      assert.equal(timestep.getLabelMinor(new Date(2017, 0, 1)), '1', 'should be correct minor label');
    });
    it('should return the correct minor label (day)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'day', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1)), '1', 'should be correct minor label');
    });
    it('should return the correct minor label (weekday)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'weekday', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1)), 'Sat 1', 'should be correct minor label');
    });
    it('should return the correct minor label (hour)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'hour', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1, 12, 45)), '12:45', 'should be correct minor label');
    });
    it('should return the correct minor label (minute)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'minute', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1, 12, 45)), '12:45', 'should be correct minor label');
    });
    it('should return the correct minor label (second)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'second', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1, 12, 45, 35)), '35', 'should be correct minor label');
    });
    it('should return the correct minor label (millisecond)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'millisecond', step: 1 });
      assert.equal(timestep.getLabelMinor(new Date(2017, 3, 1, 12, 45, 35, 123)), '123', 'should be correct minor label');
    });
  });

  describe('getLabelMajor', function () {
    it('should return the correct major label (year)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'year', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1)), '', 'should be correct major label');
    });
    it('should return the correct major label (month)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'month', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1)), '2017', 'should be correct major label');
    });
    it('should return the correct major label (week)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'week', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1)), 'April 2017', 'should be correct major label');
    });
    it('should return the correct major label (day)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'day', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1)), 'April 2017', 'should be correct major label');
    });
    it('should return the correct major label (weekday)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'day', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1)), 'April 2017', 'should be correct major label');
    });
    it('should return the correct major label (hour)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'hour', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1, 12, 45)), 'Sat 1 April', 'should be correct major label');
    });
    it('should return the correct major label (minute)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'minute', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1, 12, 45)), 'Sat 1 April', 'should be correct major label');
    });
    it('should return the correct major label (second)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'second', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1, 12, 45, 35)), '1 April 12:45', 'should be correct major label');
    });
    it('should return the correct major label (millisecond)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'millisecond', step: 1 });
      assert.equal(timestep.getLabelMajor(new Date(2017, 3, 1, 12, 45, 35, 123)), '12:45:35', 'should be correct major label');
    });
  });

  describe('getClassName', function () {
    // Stub to ensure we get the same value for `new Date()` and `Date.now()` every single time it's called.
    let mockDate = global.Date;
    mockDate.constructor = (value) => {
      if(value) return global.Date(value);
      return new Date(1575763200000);
    };
    mockDate.now = () => 1575763200000;

    before(function () {
      mockery.registerMock('../module/date', mockDate);
    });

    after(function () {
      mockery.disable();
    });

    it('should return the correct class name (year)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'year', step: 1 });
      timestep.current = new Date(2017, 3, 1);
      assert.equal(timestep.getClassName(), 'vis-year2017  vis-odd', 'should be correct class name');
      timestep.current = new Date(2019, 11, 8);
      assert.equal(timestep.getClassName(), 'vis-year2019  vis-current-year  vis-odd', 'should be correct class name');
    });

    it('should return the correct class name (month)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'month', step: 1 });
      timestep.current = new Date(2017, 3, 1);
      assert.equal(timestep.getClassName(), 'vis-april  vis-odd', 'should be correct class name');
      timestep.current = new Date(2019, 11, 8);
      assert.equal(timestep.getClassName(), 'vis-december  vis-current-month  vis-odd', 'should be correct class name');
    });

    it('should return the correct class name (week)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'week', step: 1 });
      timestep.current = new Date(2017, 3, 1);
      assert.equal(timestep.getClassName(), 'vis-week13  vis-odd', 'should be correct class name');
      timestep.current = new Date(2019, 11, 8);
      assert.equal(timestep.getClassName(), 'vis-week50  vis-current-week  vis-even', 'should be correct class name');
    });

    it('should return the correct class name (day)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'day', step: 1 });
      timestep.current = new Date(2017, 3, 1);
      assert.equal(timestep.getClassName(), 'vis-day1 vis-april vis-saturday  vis-even', 'should be correct class name');
      timestep.current = new Date(2019, 11, 8);
      assert.equal(timestep.getClassName(), 'vis-day8 vis-december  vis-today  vis-current-month  vis-today vis-sunday  vis-odd', 'should be correct class name');
    });

    it('should return the correct class name (weekday)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'weekday', step: 1 });
      timestep.current = new Date(2017, 3, 1);
      assert.equal(timestep.getClassName(), 'vis-saturday  vis-odd', 'should be correct class name');
      timestep.current = new Date(2019, 11, 8);
      assert.equal(timestep.getClassName(), 'vis-sunday  vis-today  vis-current-week  vis-even', 'should be correct class name');
    });

    it('should return the correct class name (hour)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'hour', step: 1 });
      timestep.current = new Date(2017, 3, 1, 12, 45);
      assert.equal(timestep.getClassName(), 'vis-h12  vis-even', 'should be correct class name');
      timestep.current = new Date(2019, 11, 8, 12, 45);
      assert.equal(timestep.getClassName(), 'vis-h12  vis-today  vis-even', 'should be correct class name');
      timestep.setScale({ scale: 'hour', step: 4 });
      timestep.current = new Date(2017, 3, 1, 12, 45);
      assert.equal(timestep.getClassName(), 'vis-h12-h16  vis-odd', 'should handle special case for step=4');
      timestep.current = new Date(2019, 11, 8, 12, 45);
      assert.equal(timestep.getClassName(), 'vis-h12-h16  vis-today  vis-odd', 'should handle special case for step=4');
    });

    it('should return the correct class name (minute)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'minute', step: 1 });
      timestep.current = new Date(2017, 3, 1, 12, 45);
      assert.equal(timestep.getClassName(), ' vis-odd', 'should be correct class name');
      timestep.current = new Date(2019, 11, 8, 12, 45);
      assert.equal(timestep.getClassName(), ' vis-today  vis-odd', 'should be correct class name');
    });

    it('should return the correct class name (second)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'second', step: 1 });
      timestep.current = new Date(2017, 3, 1, 12, 45, 35);
      assert.equal(timestep.getClassName(), ' vis-odd', 'should be correct class name');
      timestep.current = new Date(2019, 11, 8, 12, 45, 35);
      assert.equal(timestep.getClassName(), ' vis-today  vis-odd', 'should be correct class name');
    });

    it('should return the correct class name (millisecond)', function () {
      const timestep = new TimeStep(new Date(2017, 0, 1), new Date(2018, 11, 31));
      timestep.setScale({ scale: 'millisecond', step: 1 });
      timestep.current = new Date(2017, 3, 1, 12, 4, 35, 300);
      assert.equal(timestep.getClassName(), ' vis-even', 'should be correct class name');
      timestep.current = new Date(2019, 11, 8, 12, 45, 35, 300);
      assert.equal(timestep.getClassName(), ' vis-today  vis-even', 'should be correct class name');
    });
  });
});
