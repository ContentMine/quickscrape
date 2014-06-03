// Create a new Ticker.
//
// A Ticker is a simple counter to measure
// progress towards a goal.
//
// For example if there are 10 tasks that must
// be completed before some action is performed,
// a Ticker with length 10 can be used. The tasks
// can run asychronously and tick the Ticker as
// they finish. After 10 ticks, the Ticker's callback
// is executed.
//
// @param {Integer} length length of the ticker
// @param {Function} cb callback
var Ticker = function(length, cb) {
  if (!length) {
    throw new Error('Ticker requires a length');
  }
  if (!cb) {
    log.warn('Ticker has no callback');
  }
  this.length = length;
  this.cb = cb;
  this.progress = 0;
  log.debug('Ticker created with length', this.length);
}

// Progress by one. If the ticker is finished,
// run the callback.
Ticker.prototype.tick = function() {
  this.progress += 1;
  log.debug('Ticker progress:', this.progress, 'of', this.length);
  if (this.progress == this.length) {
    log.debug('Ticker finished');
    this.cb();
  }
}

// Lengthen the ticker by `x`.
Ticker.prototype.elongate = function(x) {
  this.length += x || 1;
}

module.exports = Ticker;
