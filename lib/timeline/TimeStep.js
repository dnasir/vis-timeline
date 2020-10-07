import * as DateUtil  from './DateUtil';
import util from '../util';
import {
  set,
  add,
  sub,
  getDay,
  setDay,
  isEqual,
  addDays,
  getWeek,
  isSameMonth,
  setWeek,
  format
} from 'date-fns';

/**
 * The class TimeStep is an iterator for dates. You provide a start date and an
 * end date. The class itself determines the best scale (step size) based on the
 * provided start Date, end Date, and minimumStep.
 *
 * If minimumStep is provided, the step size is chosen as close as possible
 * to the minimumStep but larger than minimumStep. If minimumStep is not
 * provided, the scale is set to 1 DAY.
 * The minimumStep should correspond with the onscreen size of about 6 characters
 *
 * Alternatively, you can set a scale by hand.
 * After creation, you can initialize the class by executing first(). Then you
 * can iterate from the start date to the end date via next(). You can check if
 * the end date is reached with the function hasNext(). After each step, you can
 * retrieve the current date via getCurrent().
 * The TimeStep has scales ranging from milliseconds, seconds, minutes, hours,
 * days, to years.
 *
 * Version: 1.2
 *
 */
class TimeStep {
  /**
    * @param {Date} [start]         The start date, for example new Date(2010, 9, 21)
    *                               or new Date(2010, 9, 21, 23, 45, 00)
    * @param {Date} [end]           The end date
    * @param {number} [minimumStep] Optional. Minimum step size in milliseconds
    * @param {Date|Array.<Date>} [hiddenDates] Optional.
    * @param {{showMajorLabels: boolean, showWeekScale: boolean}} [options] Optional.
    * @constructor  TimeStep
    */
  constructor(start, end, minimumStep, hiddenDates, options) {
    this.options = options ? options : {};

    // variables
    this.current = Date.now();
    this._start = Date.now();
    this._end = Date.now();

    this.autoScale  = true;
    this.scale = 'day';
    this.step = 1;

    // initialize the range
    this.setRange(start, end, minimumStep);

    // hidden Dates options
    this.switchedDay = false;
    this.switchedMonth = false;
    this.switchedYear = false;
    if (Array.isArray(hiddenDates)) {
      this.hiddenDates = hiddenDates;
    }
    else if (hiddenDates != undefined) {
      this.hiddenDates = [hiddenDates];
    }
    else {
      this.hiddenDates = [];
    }

    this.format = TimeStep.FORMAT; // default formatting
  }

  /**
   * Set custom formatting for the minor an major labels of the TimeStep.
   * Both `minorLabels` and `majorLabels` are an Object with properties:
   * 'millisecond', 'second', 'minute', 'hour', 'weekday', 'day', 'week', 'month', 'year'.
   * @param {{minorLabels: Object, majorLabels: Object}} format
   */
  setFormat(format) {
    const defaultFormat = util.deepExtend({}, TimeStep.FORMAT);
    this.format = util.deepExtend(defaultFormat, format);
  }

  /**
   * Set a new range
   * If minimumStep is provided, the step size is chosen as close as possible
   * to the minimumStep but larger than minimumStep. If minimumStep is not
   * provided, the scale is set to 1 DAY.
   * The minimumStep should correspond with the onscreen size of about 6 characters
   * @param {Date} [start]      The start date and time.
   * @param {Date} [end]        The end date and time.
   * @param {int} [minimumStep] Optional. Minimum step size in milliseconds
   */
  setRange(start, end, minimumStep) {
    if (!(start instanceof Date) || !(end instanceof Date)) {
      throw  "No legal start or end date in method setRange";
    }

    this._start = (start != undefined) ? start.valueOf() : Date.now();
    this._end = (end != undefined) ? end.valueOf() : Date.now();

    if (this.autoScale) {
      this.setMinimumStep(minimumStep);
    }
  }

  /**
   * Set the range iterator to the start date.
   */
  start() {
    this.current = new Date(this._start);
    this.roundToMinor();
  }

  /**
   * Round the current date to the first minor date value
   * This must be executed once when the current date is set to start Date
   */
  roundToMinor() {
    // round to floor
    // to prevent year & month scales rounding down to the first day of week we perform this separately
    if (this.scale == 'week') {
      this.current = setDay(this.current, 0);
    }
    // IMPORTANT: we have no breaks in this switch! (this is no bug)
    // noinspection FallThroughInSwitchStatementJS
    switch (this.scale) {
      case 'year':
        this.current = set(this.current, { 
          year: this.step * Math.floor(this.current.getFullYear() / this.step),
          month: 0
        });
      case 'month':        this.current = set(this.current, { date: 1 });          // eslint-disable-line no-fallthrough
      case 'week':                                        // eslint-disable-line no-fallthrough
      case 'day':                                         // eslint-disable-line no-fallthrough
      case 'weekday':      this.current = set(this.current, { hours: 0 });         // eslint-disable-line no-fallthrough
      case 'hour':         this.current = set(this.current, { minutes: 0 });       // eslint-disable-line no-fallthrough
      case 'minute':       this.current = set(this.current, { seconds: 0 });       // eslint-disable-line no-fallthrough
      case 'second':       this.current = set(this.current, { milliseconds: 0 });  // eslint-disable-line no-fallthrough
      //case 'millisecond': // nothing to do for milliseconds
    }

    if (this.step != 1) {
      // round down to the first minor value that is a multiple of the current step size
      let  priorCurrent = new Date(this.current);
      switch (this.scale) {        
        case 'millisecond':  this.current = sub(this.current, { milliseconds : this.current.getMilliseconds() % this.step }); break;
        case 'second':       this.current = sub(this.current, { seconds: this.current.getSeconds() % this.step }); break;
        case 'minute':       this.current = sub(this.current, { 'minutes': this.current.getMinutes() % this.step }); break;
        case 'hour':         this.current = sub(this.current, { 'hours': this.current.getHours() % this.step }); break;
        case 'weekday':      // intentional fall through
        case 'day':          this.current = sub(this.current, { 'day': (this.current.getDate() - 1) % this.step }); break;
        case 'week':         this.current = sub(this.current, { 'week': getDay(this.current) % this.step }); break;
        case 'month':        this.current = sub(this.current, { 'month': this.current.getMonth() % this.step }); break;
        case 'year':         this.current = sub(this.current, { 'year': this.current.getFullYear() % this.step }); break;
        default: break;
      }
      if (!isEqual(priorCurrent, this.current)) {
          this.current = DateUtil.snapAwayFromHidden(this.hiddenDates, this.current.valueOf(), -1, true);
      }
    }
  }

  /**
   * Check if the there is a next step
   * @return {boolean}  true if the current date has not passed the end date
   */
  hasNext() {
    return (this.current.valueOf() <= this._end.valueOf());
  }

  /**
   * Do the next step
   */
  next() {
    const prev = this.current.valueOf();

    // Two cases, needed to prevent issues with switching daylight savings
    // (end of March and end of October)
    switch (this.scale) {
      case 'millisecond':  this.current = add(this.current, { millisecond: this.step }); break;
      case 'second':       this.current = add(this.current, { second: this.step }); break;
      case 'minute':       this.current = add(this.current, { minute: this.step }); break;
      case 'hour':
        this.current = add(this.current, { hours: this.step });

        if (this.current.getMonth() < 6) {
          this.current = sub(this.current, { hours: this.current.getHours() % this.step });
        } else {
          if (this.current.getHours() % this.step !== 0) {
            this.current = add(this.current, { hours: this.step - this.current.getHours() % this.step });
          }
        }
        break;
      case 'weekday':      // intentional fall through
      case 'day':          this.current = addDays(this.current, this.step); break;
      case 'week':
        if (getDay(this.current) !== 0){ // we had a month break not correlating with a week's start before
          this.current = setDay(this.current, 0); // switch back to week cycles
          this.current = add(this.current, { weeks: this.step });
        } else if(this.options.showMajorLabels === false) {
          this.current = add(this.current, { weeks: this.step }); // the default case
        } else { // first day of the week
          let nextWeek = add(this.current, { weeks: 1 });
          if(isSameMonth(nextWeek, this.current)){ // is the first day of the next week in the same month?
            this.current = add(this.current, { weeks: this.step }); // the default case
          } else { // inject a step at each first day of the month
            this.current = add(this.current, { weeks: this.step });
            this.current = set(this.current, { date: 1 });
          }
        }
        break;
      case 'month':        this.current = add(this.current, { months: this.step }); break;
      case 'year':         this.current = add(this.current, { years: this.step }); break;
      default: break;
    }

    if (this.step != 1) {
      // round down to the correct major value
      switch (this.scale) {
        case 'millisecond':  if(this.current.getMilliseconds() > 0 && this.current.getMilliseconds() < this.step) this.current = set(this.current, { milliseconds: 0 });  break;
        case 'second':       if(this.current.getSeconds() > 0 && this.current.getSeconds() < this.step) this.current = set(this.current, { seconds: 0 });  break;
        case 'minute':       if(this.current.minutes() > 0 && this.current.minutes() < this.step) this.current = set(this.current, { minutes: 0 }); break;
        case 'hour':         if(this.current.getHours() > 0 && this.current.getHours() < this.step) this.current = set(this.current, { hours: 0 });  break;
        case 'weekday':      // intentional fall through
        case 'day':          if(this.current.getDate() < this.step+1) this.current = set(this.current, { date: 1 }); break;
        case 'week':         if(getWeek(this.current) < this.step) this.current = setWeek(this.current, 1); break; // week numbering starts at 1, not 0
        case 'month':        if(this.current.getMonth() < this.step) this.current = set(this.current, { month: 0 });  break;
        case 'year':         break; // nothing to do for year
        default:             break;
      }
    }

    // safety mechanism: if current time is still unchanged, move to the end
    if (this.current.valueOf() == prev) {
      this.current = new Date(this._end);
    }

    // Reset switches for year, month and day. Will get set to true where appropriate in DateUtil.stepOverHiddenDates
    this.switchedDay = false;
    this.switchedMonth = false;
    this.switchedYear = false;

    DateUtil.stepOverHiddenDates(this, prev);
  }

  /**
   * Get the current datetime
   * @return {Date}  current The current date
   */
  getCurrent() {
    return new Date(this.current);
  }

  /**
   * Set a custom scale. Autoscaling will be disabled.
   * For example setScale('minute', 5) will result
   * in minor steps of 5 minutes, and major steps of an hour.
   *
   * @param {{scale: string, step: number}} params
   *                               An object containing two properties:
   *                               - A string 'scale'. Choose from 'millisecond', 'second',
   *                                 'minute', 'hour', 'weekday', 'day', 'week', 'month', 'year'.
   *                               - A number 'step'. A step size, by default 1.
   *                                 Choose for example 1, 2, 5, or 10.
   */
  setScale(params) {
    if (params && typeof params.scale == 'string') {
      this.scale = params.scale;
      this.step = params.step > 0 ? params.step : 1;
      this.autoScale = false;
    }
  }

  /**
   * Enable or disable autoscaling
   * @param {boolean} enable  If true, autoascaling is set true
   */
  setAutoScale(enable) {
    this.autoScale = enable;
  }

  /**
   * Automatically determine the scale that bests fits the provided minimum step
   * @param {number} [minimumStep]  The minimum step size in milliseconds
   */
  setMinimumStep(minimumStep) {
    if (minimumStep == undefined) {
      return;
    }

    //var b = asc + ds;

    const stepYear       = (1000 * 60 * 60 * 24 * 30 * 12);
    const stepMonth      = (1000 * 60 * 60 * 24 * 30);
    const stepDay        = (1000 * 60 * 60 * 24);
    const stepHour       = (1000 * 60 * 60);
    const stepMinute     = (1000 * 60);
    const stepSecond     = (1000);
    const stepMillisecond= (1);

    // find the smallest step that is larger than the provided minimumStep
    if (stepYear*1000 > minimumStep)        {this.scale = 'year';        this.step = 1000;}
    if (stepYear*500 > minimumStep)         {this.scale = 'year';        this.step = 500;}
    if (stepYear*100 > minimumStep)         {this.scale = 'year';        this.step = 100;}
    if (stepYear*50 > minimumStep)          {this.scale = 'year';        this.step = 50;}
    if (stepYear*10 > minimumStep)          {this.scale = 'year';        this.step = 10;}
    if (stepYear*5 > minimumStep)           {this.scale = 'year';        this.step = 5;}
    if (stepYear > minimumStep)             {this.scale = 'year';        this.step = 1;}
    if (stepMonth*3 > minimumStep)          {this.scale = 'month';       this.step = 3;}
    if (stepMonth > minimumStep)            {this.scale = 'month';       this.step = 1;}
    if (stepDay*7 > minimumStep && this.options.showWeekScale)            {this.scale = 'week';        this.step = 1;}
    if (stepDay*2 > minimumStep)            {this.scale = 'day';         this.step = 2;}
    if (stepDay > minimumStep)              {this.scale = 'day';         this.step = 1;}
    if (stepDay/2 > minimumStep)            {this.scale = 'weekday';     this.step = 1;}
    if (stepHour*4 > minimumStep)           {this.scale = 'hour';        this.step = 4;}
    if (stepHour > minimumStep)             {this.scale = 'hour';        this.step = 1;}
    if (stepMinute*15 > minimumStep)        {this.scale = 'minute';      this.step = 15;}
    if (stepMinute*10 > minimumStep)        {this.scale = 'minute';      this.step = 10;}
    if (stepMinute*5 > minimumStep)         {this.scale = 'minute';      this.step = 5;}
    if (stepMinute > minimumStep)           {this.scale = 'minute';      this.step = 1;}
    if (stepSecond*15 > minimumStep)        {this.scale = 'second';      this.step = 15;}
    if (stepSecond*10 > minimumStep)        {this.scale = 'second';      this.step = 10;}
    if (stepSecond*5 > minimumStep)         {this.scale = 'second';      this.step = 5;}
    if (stepSecond > minimumStep)           {this.scale = 'second';      this.step = 1;}
    if (stepMillisecond*200 > minimumStep)  {this.scale = 'millisecond'; this.step = 200;}
    if (stepMillisecond*100 > minimumStep)  {this.scale = 'millisecond'; this.step = 100;}
    if (stepMillisecond*50 > minimumStep)   {this.scale = 'millisecond'; this.step = 50;}
    if (stepMillisecond*10 > minimumStep)   {this.scale = 'millisecond'; this.step = 10;}
    if (stepMillisecond*5 > minimumStep)    {this.scale = 'millisecond'; this.step = 5;}
    if (stepMillisecond > minimumStep)      {this.scale = 'millisecond'; this.step = 1;}
  }

  /**
   * Snap a date to a rounded value.
   * The snap intervals are dependent on the current scale and step.
   * Static function
   * @param {Date} date    the date to be snapped.
   * @param {string} scale Current scale, can be 'millisecond', 'second',
   *                       'minute', 'hour', 'weekday, 'day', 'week', 'month', 'year'.
   * @param {number} step  Current step (1, 2, 4, 5, ...
   * @return {Date} snappedDate
   */
  static snap(date, scale, step) {
    let clone = new Date(date.getTime());

    if (scale == 'year') {
      const year = clone.getFullYear() + Math.round(clone.getMonth() / 12);
      clone = set(clone, {
        year: Math.round(year / step) * step,
        month: 0,
        date: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
      });
    }
    else if (scale == 'month') {
      clone = set(clone, { date: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });

      if (clone.getDate() > 15) {
        clone = add(clone, { month: 1 });
      }
    }
    else if (scale == 'week') {
      clone = setDay(clone, 0);
      clone = set(clone, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });

      if (getDay(clone) > 2) {
        clone = add(clone, { week: 1 });
      }
    }
    else if (scale == 'day') {
      //noinspection FallthroughInSwitchStatementJS
      switch (step) {
        case 5:
        case 2:
          clone = set(clone, { hours: Math.round(clone.getHours() / 24) * 24 }); break;
        default:
          clone = set(clone, { hours: Math.round(clone.getHours() / 12) * 12 }); break;
      }
      clone = set(clone, {
        minutes: 0,
        seconds: 0,
        milliseconds: 0
      });
    }
    else if (scale == 'weekday') {
      //noinspection FallthroughInSwitchStatementJS
      switch (step) {
        case 5:
        case 2:
          clone = set(clone, { hours: Math.round(clone.getHours() / 12) * 12 }); break;
        default:
          clone = set(clone, { hours: Math.round(clone.getHours() / 6) * 6 }); break;
      }
      clone = set(clone, {
        minutes: 0,
        seconds: 0,
        milliseconds: 0
      });
    }
    else if (scale == 'hour') {
      switch (step) {
        case 4:
          clone = set(clone, { minutes: Math.round(clone.getMinutes() / 60) * 60 }); break;
        default:
          clone = set(clone, { minutes: Math.round(clone.getMinutes() / 30) * 30 }); break;
      }
      clone = set(clone, {
        seconds: 0,
        milliseconds: 0
      });
    } else if (scale == 'minute') {
      //noinspection FallthroughInSwitchStatementJS
      switch (step) {
        case 15:
        case 10:
          clone = set(clone, {
            minutes: Math.round(clone.minutes() / 5) * 5,
            seconds: 0
          });
          break;
        case 5:
          clone = set(clone, { seconds: Math.round(clone.getSeconds() / 60) * 60 }); break;
        default:
          clone = set(clone, { seconds: Math.round(clone.getSeconds() / 30) * 30 }); break;
      }
      clone = set(clone, { milliseconds: 0 });
    }
    else if (scale == 'second') {
      //noinspection FallthroughInSwitchStatementJS
      switch (step) {
        case 15:
        case 10:
          clone = set(clone, {
            seconds: Math.round(clone.getSeconds() / 5) * 5,
            milliseconds: 0
          });
          break;
        case 5:
          clone = set(clone, { milliseconds: Math.round(clone.getMilliseconds() / 1000) * 1000 }); break;
        default:
          clone = set(clone, { milliseconds: Math.round(clone.getMilliseconds() / 500) * 500 }); break;
      }
    }
    else if (scale == 'millisecond') {
      const _step = step > 5 ? step / 2 : 1;
      clone = set(clone, { milliseconds: Math.round(clone.getMilliseconds() / _step) * _step });
    }

    return clone;
  }

  /**
   * Check if the current value is a major value (for example when the step
   * is DAY, a major value is each first day of the MONTH)
   * @return {boolean} true if current date is major, else false.
   */
  isMajor() {
    if (this.switchedYear == true) {
      switch (this.scale) {
        case 'year':
        case 'month':
        case 'week':
        case 'weekday':
        case 'day':
        case 'hour':
        case 'minute':
        case 'second':
        case 'millisecond':
          return true;
        default:
          return false;
      }
    }
    else if (this.switchedMonth == true) {
      switch (this.scale) {
        case 'week':
        case 'weekday':
        case 'day':
        case 'hour':
        case 'minute':
        case 'second':
        case 'millisecond':
          return true;
        default:
          return false;
      }
    }
    else if (this.switchedDay == true) {
      switch (this.scale) {
        case 'millisecond':
        case 'second':
        case 'minute':
        case 'hour':
          return true;
        default:
          return false;
      }
    }

    switch (this.scale) {
      case 'millisecond':
        return (this.current.getMilliseconds() == 0);
      case 'second':
        return (this.current.getSeconds() == 0);
      case 'minute':
        return /*(this.current.getHours() == 0) &&*/ (this.current.getMinutes() == 0); // shouldn't this be just the first minute of the hour?
      case 'hour':
        return (this.current.getHours() == 0);
      case 'weekday': // intentional fall through
      case 'day':
        return (this.current.getDate() == 1);
      case 'week':
        return (this.current.getDate() == 1);
      case 'month':
        return (this.current.getMonth() == 0);
      case 'year':
        return false;
      default:
        return false;
    }
  }

  /**
   * Returns formatted text for the minor axislabel, depending on the current
   * date and the scale. For example when scale is MINUTE, the current time is
   * formatted as "hh:mm".
   * @param {Date} [date=this.current] custom date. if not provided, current date is taken
   * @returns {String}
   */
  getLabelMinor(date) {
    if (date == undefined) {
      date = this.current;
    }

    if (typeof(this.format.minorLabels) === "function") {
      return this.format.minorLabels(date, this.scale, this.step);
    }

    const formatString = this.format.minorLabels[this.scale];
    // noinspection FallThroughInSwitchStatementJS
    switch (this.scale) {
      case 'week':
        // Don't draw the minor label if this date is the first day of a month AND if it's NOT the start of the week.
        // The 'date' variable may actually be the 'next' step when called from TimeAxis' _repaintLabels.
        if(date.getDate() === 1 && getDay(date) !== 0){
            return "";
        }
      default: // eslint-disable-line no-fallthrough
        return (formatString && formatString.length > 0) ? format(date, formatString) : '';
    }
  }

  /**
   * Returns formatted text for the major axis label, depending on the current
   * date and the scale. For example when scale is MINUTE, the major scale is
   * hours, and the hour will be formatted as "hh".
   * @param {Date} [date=this.current] custom date. if not provided, current date is taken
   * @returns {String}
   */
  getLabelMajor(date) {
    if (date == undefined) {
      date = this.current;
    }
    if (date instanceof Date) {
      date = this.moment(date)
    }

    if (typeof(this.format.majorLabels) === "function") {
      return this.format.majorLabels(date, this.scale, this.step);
    }

    const format = this.format.majorLabels[this.scale];
    return (format && format.length > 0) ? this.moment(date).format(format) : '';
  }

  /**
   * get class name
   * @return {string} class name
   */
  getClassName() {
    const _moment = this.moment;
    const m = this.moment(this.current);
    const current = m.locale ? m.locale('en') : m.lang('en'); // old versions of moment have .lang() function
    const step = this.step;
    const classNames = [];

    /**
     *
     * @param {number} value
     * @returns {String}
     */
    function even(value) {
      return (value / step % 2 == 0) ? ' vis-even' : ' vis-odd';
    }

    /**
     *
     * @param {Date} date
     * @returns {String}
     */
    function today(date) {
      if (date.isSame(Date.now(), 'day')) {
        return ' vis-today';
      }
      if (date.isSame(_moment().add(1, 'day'), 'day')) {
        return ' vis-tomorrow';
      }
      if (date.isSame(_moment().add(-1, 'day'), 'day')) {
        return ' vis-yesterday';
      }
      return '';
    }

    /**
     *
     * @param {Date} date
     * @returns {String}
     */
    function currentWeek(date) {
      return date.isSame(Date.now(), 'week') ? ' vis-current-week' : '';
    }

    /**
     *
     * @param {Date} date
     * @returns {String}
     */
    function currentMonth(date) {
      return date.isSame(Date.now(), 'month') ? ' vis-current-month' : '';
    }

    /**
     *
     * @param {Date} date
     * @returns {String}
     */
    function currentYear(date) {
      return date.isSame(Date.now(), 'year') ? ' vis-current-year' : '';
    }

    switch (this.scale) {
      case 'millisecond':
        classNames.push(today(current));
        classNames.push(even(current.getMilliseconds()));
        break;
      case 'second':
        classNames.push(today(current));
        classNames.push(even(current.getSeconds()));
        break;
      case 'minute':
        classNames.push(today(current));
        classNames.push(even(current.minutes()));
        break;
      case 'hour':
        classNames.push(`vis-h${current.getHours()}${this.step == 4 ? '-h' + (current.getHours() + 4) : ''}`);
        classNames.push(today(current));
        classNames.push(even(current.getHours()));
        break;
      case 'weekday':
        classNames.push(`vis-${current.format('dddd').toLowerCase()}`);
        classNames.push(today(current));
        classNames.push(currentWeek(current));
        classNames.push(even(current.date()));
        break;
      case 'day':
        classNames.push(`vis-day${current.date()}`);
        classNames.push(`vis-${current.format('MMMM').toLowerCase()}`);
        classNames.push(today(current));
        classNames.push(currentMonth(current));
        classNames.push(this.step <= 2 ? today(current) : '');
        classNames.push(this.step <= 2 ? `vis-${current.format('dddd').toLowerCase()}` : '');
        classNames.push(even(current.date() - 1));
        break;
      case 'week':
        classNames.push(`vis-week${current.format('w')}`);
        classNames.push(currentWeek(current));
        classNames.push(even(current.week()));
        break;
      case 'month':
        classNames.push(`vis-${current.format('MMMM').toLowerCase()}`);
        classNames.push(currentMonth(current));
        classNames.push(even(current.month()));
        break;
      case 'year':
        classNames.push(`vis-year${current.year()}`);
        classNames.push(currentYear(current));
        classNames.push(even(current.year()));
        break;
    }
    return classNames.filter(String).join(" ");
  }
}

// Time formatting
TimeStep.FORMAT = {
  minorLabels: {
    millisecond:'SSS',
    second:     's',
    minute:     'HH:mm',
    hour:       'HH:mm',
    weekday:    'EEE d',
    day:        'd',
    week:       'w',
    month:      'MMM',
    year:       'yyyy'
  },
  majorLabels: {
    millisecond:'HH:mm:ss',
    second:     'D MMMM HH:mm',
    minute:     'ddd D MMMM',
    hour:       'ddd D MMMM',
    weekday:    'MMMM YYYY',
    day:        'MMMM YYYY',
    week:       'MMMM YYYY',
    month:      'YYYY',
    year:       ''
  }
};

export default TimeStep;
