var Ticker = function(length, cb) {
  this.length = length;
  this.cb = cb;
  this.progress = 0;
}

Ticker.prototype.tick = function() {
  this.progress += 1;
  if (this.progress == this.length) {
    this.cb();
  }
}

Ticker.prototype.elongate = function(x) {
  this.length += x;
}

module.exports = Ticker;
