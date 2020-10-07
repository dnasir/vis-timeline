import assert from "assert";
import { convertHiddenOptions } from "../lib/timeline/DateUtil";

describe("DateUtil", () => {
  describe("convertHiddenOptions", () => {
    let body;

    beforeEach(() => {
      body = {};
    });

    it("should throw when passed invalid values", () => {
      const data = {
        start: "lorem ipsum",
        end: "dolor sit",
      };

      assert.throws(() => convertHiddenOptions(body, data), new Error("Invalid Date"));
    });
    it("should build hidden dates list (object)", () => {
      const data = {
        start: "2014-03-21 00:00:00",
        end: "2014-03-28 00:00:00",
      };
      const startDate = new Date(data.start).valueOf();
      const endDate = new Date(data.end).valueOf();

      convertHiddenOptions(body, data);

      assert.strictEqual(1, body.hiddenDates.length, "should contain list of objects");
      assert.strictEqual('number', typeof body.hiddenDates[0].start, "should convert string to number");
      assert.strictEqual(startDate, body.hiddenDates[0].start, "timestamp value should match original date string");
      assert.strictEqual('number', typeof body.hiddenDates[0].end, "should convert string to number");
      assert.strictEqual(endDate, body.hiddenDates[0].end, "timestamp value should match original date string");
    });
    it("should build hidden dates list (array)", () => {
      const data = [
        {
          start: "2014-03-21 00:00:00",
          end: "2014-03-28 00:00:00",
        },
        {
          start: "2014-03-12 00:00:00",
          end: "2014-04-01 00:00:00",
        }
      ];
      const startDate1 = new Date(data[0].start).valueOf();
      const endDate1 = new Date(data[0].end).valueOf();
      const startDate2 = new Date(data[1].start).valueOf();
      const endDate2 = new Date(data[1].end).valueOf();

      convertHiddenOptions(body, data);

      assert.strictEqual(2, body.hiddenDates.length, "should contain list of objects");
      assert.strictEqual('number', typeof body.hiddenDates[0].start, "should convert string to number");
      assert.strictEqual(startDate2, body.hiddenDates[0].start, "timestamp value should match original date string");
      assert.strictEqual('number', typeof body.hiddenDates[0].end, "should convert string to number");
      assert.strictEqual(endDate2, body.hiddenDates[0].end, "timestamp value should match original date string");
      assert.strictEqual('number', typeof body.hiddenDates[1].start, "should convert string to number");
      assert.strictEqual(startDate1, body.hiddenDates[1].start, "timestamp value should match original date string");
      assert.strictEqual('number', typeof body.hiddenDates[1].end, "should convert string to number");
      assert.strictEqual(endDate1, body.hiddenDates[1].end, "timestamp value should match original date string");
    });
  });
});
