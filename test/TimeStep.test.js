import assert from 'assert'
import jsdom_global from 'jsdom-global'
import TimeStep from '../lib/timeline/TimeStep'

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

});
