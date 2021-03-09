import assert from 'assert'
import jsdom_global from 'jsdom-global'
import PointItem from "../lib/timeline/component/item/PointItem"
import Range from '../lib/timeline/Range'
import TestSupport from './TestSupport'
import sinon from 'sinon';

const internals = {}
const sandbox = sinon.createSandbox();

describe('Timeline PointItem', function () {
  
  let now;

  before(function () {
    now = new Date();
    internals.jsdom_global = jsdom_global();
  });

  after(function () {
    internals.jsdom_global();
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should initialize with minimal data', function () {
    const pointItem = new PointItem({start: now}, null, null);
    assert.equal(pointItem.props.content.height, 0);
    assert.deepEqual(pointItem.data.start, now);
  });

  it('should have a default width of 0', function () {
    const pointItem = new PointItem({start: now}, null, null);
    assert.equal(pointItem.getWidthRight(), 0);
    assert.equal(pointItem.getWidthLeft(), 0);
   });

  it('should error if there is missing data', function () {
    assert.throws(function () { new PointItem({}, null, null)}, Error);
  });

  it('should be visible if the range is during', function () {
    const range = new Range(TestSupport.buildSimpleTimelineRangeBody());
    range.start = new Date(now);
    range.start.setSeconds(now.getSeconds() - 1);
    range.end = new Date(range.start);
    range.end.setHours(range.start.getHours() + 1);
    const pointItem = new PointItem({start: now}, null, null);
    assert(pointItem.isVisible(range));
  });

  it('should not be visible if the range is after', function () {
    const range = new Range(TestSupport.buildSimpleTimelineRangeBody());
    range.start = new Date(now);
    range.start.setSeconds(now.getSeconds() + 1);
    range.end = new Date(range.start);
    range.end.setHours(range.start.getHours() + 1);
    const pointItem = new PointItem({start: now}, null, null);
    assert(!pointItem.isVisible(range));
  });

  it('should not be visible if the range is before', function () {
    const now = new Date();
    const range = new Range(TestSupport.buildSimpleTimelineRangeBody());
    range.end = new Date(now);
    range.end.setSeconds(now.getSeconds() - 1);
    range.start = new Date(range.end)
    range.start.setHours(range.start.getHours() - 1);
    const pointItem = new PointItem({start: now}, null, null);
    assert(!pointItem.isVisible(range));
  });

  it('should be visible for a "now" point with a default range', function () {
    const range = new Range(TestSupport.buildSimpleTimelineRangeBody());
    const pointItem = new PointItem({start: now}, null, null);
    assert(pointItem.isVisible(range));
  });


  describe('should redraw() and then', function () {

    it('not be dirty', function () {
      const pointItem = new PointItem({start: now}, null, {editable: false});
      pointItem.setParent(TestSupport.buildMockItemSet());
      assert(pointItem.dirty);
      pointItem.redraw();
      assert(!pointItem.dirty);
    });


    it('have point attached to its parent', function () {
      const pointItem = new PointItem({start: now}, null, {editable: false});
      const parent = TestSupport.buildMockItemSet();
      pointItem.setParent(parent);
      assert(!parent.dom.foreground.hasChildNodes());
      pointItem.redraw();
      assert(parent.dom.foreground.hasChildNodes());
    });


    describe('have the correct classname for', function () {

      it('a non-editable item', function () {
        const pointItem = new PointItem({start: now, editable: false}, null, {editable: false});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.dom.dot.className, "vis-item vis-dot vis-readonly");
        assert.equal(pointItem.dom.point.className, "vis-item vis-point vis-readonly");
      });

      it('an editable item (with object option)', function () {
        const pointItem = new PointItem({start: now}, null, {editable: {updateTime: true, updateGroup: false}});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.dom.dot.className, "vis-item vis-dot vis-editable");
        assert.equal(pointItem.dom.point.className, "vis-item vis-point vis-editable");
      });

      it('an editable item (with boolean option)', function () {
        const pointItem = new PointItem({start: now}, null, {editable: true});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.dom.dot.className, "vis-item vis-dot vis-editable");
        assert.equal(pointItem.dom.point.className, "vis-item vis-point vis-editable");
      });

      it('an editable:false override item (with boolean option)', function () {
        const pointItem = new PointItem({start: now, editable: false}, null, {editable: true});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.dom.dot.className, "vis-item vis-dot vis-readonly");
        assert.equal(pointItem.dom.point.className, "vis-item vis-point vis-readonly");
      });

      it('an editable:true override item (with boolean option)', function () {
        const pointItem = new PointItem({start: now, editable: true}, null, {editable: false});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.dom.dot.className, "vis-item vis-dot vis-editable");
        assert.equal(pointItem.dom.point.className, "vis-item vis-point vis-editable");
      });

      it('an editable:false override item (with object option)', function () {
        const pointItem = new PointItem({start: now, editable: false}, null, {editable: {updateTime: true, updateGroup: false}});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.dom.dot.className, "vis-item vis-dot vis-readonly");
        assert.equal(pointItem.dom.point.className, "vis-item vis-point vis-readonly");
      });

      it('an editable:false override item (with object option for group change)', function () {
        const pointItem = new PointItem({start: now, editable: false}, null, {editable: {updateTime: false, updateGroup: true}});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.dom.dot.className, "vis-item vis-dot vis-readonly");
        assert.equal(pointItem.dom.point.className, "vis-item vis-point vis-readonly");
      });

      it('an editable:true override item (with object option)', function () {
        const pointItem = new PointItem({start: now, editable: true}, null, {editable: {updateTime: false, updateGroup: false}});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.dom.dot.className, "vis-item vis-dot vis-editable");
        assert.equal(pointItem.dom.point.className, "vis-item vis-point vis-editable");
      });

      it('an editable:true non-override item (with object option)', function () {
        const pointItem = new PointItem({start: now, editable: true}, null, {editable: {updateTime: false, updateGroup: false, overrideItems: true}});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.dom.dot.className, "vis-item vis-dot vis-readonly");
        assert.equal(pointItem.dom.point.className, "vis-item vis-point vis-readonly");
      });

      it('an editable:false non-override item (with object option)', function () {
        const pointItem = new PointItem({start: now, editable: false}, null, {editable: {updateTime: true, updateGroup: false, overrideItems: true}});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.dom.dot.className, "vis-item vis-dot vis-editable");
        assert.equal(pointItem.dom.point.className, "vis-item vis-point vis-editable");
      });

      it('an editable: {updateTime} override item (with boolean option)', function () {
        const pointItem = new PointItem({start: now, editable: {updateTime: true}}, null, {editable: true});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.editable.updateTime, true);
        assert.equal(pointItem.editable.updateGroup, undefined);
        assert.equal(pointItem.editable.remove, undefined);
      });

      it('an editable: {updateTime} override item (with boolean option false)', function () {
        const pointItem = new PointItem({start: now, editable: {updateTime: true}}, null, {editable: false});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.editable.updateTime, true);
        assert.equal(pointItem.editable.updateGroup, undefined);
        assert.equal(pointItem.editable.remove, undefined);
      });

      it('an editable: {updateGroup} override item (with boolean option)', function () {
        const pointItem = new PointItem({start: now, editable: {updateGroup: true}}, null, {editable: true});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.editable.updateTime, undefined);
        assert.equal(pointItem.editable.updateGroup, true);
        assert.equal(pointItem.editable.remove, undefined);
      });

    }); // have the correct classname for


    describe('have the correct property for', function () {

      it('an editable: {updateGroup} override item (with boolean option false)', function () {
        const pointItem = new PointItem({start: now, editable: {updateGroup: true}}, null, {editable: false});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.editable.updateTime, undefined);
        assert.equal(pointItem.editable.updateGroup, true);
        assert.equal(pointItem.editable.remove, undefined);
      });

      it('an editable: {remove} override item (with boolean option)', function () {
        const pointItem = new PointItem({start: now, editable: {remove: true}}, null, {editable: true});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.editable.updateTime, undefined);
        assert.equal(pointItem.editable.updateGroup, undefined);
        assert.equal(pointItem.editable.remove, true);
      });

      it('an editable: {remove} override item (with boolean option false)', function () {
        const pointItem = new PointItem({start: now, editable: {remove: true}}, null, {editable: false});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.editable.updateTime, undefined);
        assert.equal(pointItem.editable.updateGroup, undefined);
        assert.equal(pointItem.editable.remove, true);
      });

      it('an editable: {updateTime, remove} override item (with boolean option)', function () {
        const pointItem = new PointItem({start: now, editable: {updateTime: true, remove: true}}, null, {editable: true});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.editable.updateTime, true);
        assert.equal(pointItem.editable.updateGroup, undefined);
        assert.equal(pointItem.editable.remove, true);
      });

      it('an editable: {updateTime, remove} override item (with boolean option false)', function () {
        const pointItem = new PointItem({start: now, editable: {updateTime: true, remove: true}}, null, {editable: false});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.editable.updateTime, true);
        assert.equal(pointItem.editable.updateGroup, undefined);
        assert.equal(pointItem.editable.remove, true);
      });

      it('an editable: {updateTime, updateGroup, remove} override item (with boolean option)', function () {
        const pointItem = new PointItem({start: now, editable: {updateTime: true, updateGroup: true, remove: true}}, null, {editable: true});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.editable.updateTime, true);
        assert.equal(pointItem.editable.updateGroup, true);
        assert.equal(pointItem.editable.remove, true);
      });

      it('an editable: {updateTime, updateGroup, remove} override item (with boolean option false)', function () {
        const pointItem = new PointItem({start: now, editable: {updateTime: true, updateGroup: true, remove: true}}, null, {editable: false});
        const parent = TestSupport.buildMockItemSet();
        pointItem.setParent(parent);
        pointItem.redraw();
        assert.equal(pointItem.editable.updateTime, true);
        assert.equal(pointItem.editable.updateGroup, true);
        assert.equal(pointItem.editable.remove, true);
      });

    }); // have the correct property for
  });  // should redraw() and then
});  // Timeline PointItem
