var Ticker = require('../lib/ticker.js');
var should = require('should');
log = {
  info: function(){},
  warn: function(){},
  error: function(){},
  debug: function(){}
};

describe("Ticker", function() {

  describe("()", function() {

    it("should init with length and callback", function() {
      var t = new Ticker(10);
      t.length.should.be.exactly(10);
    });

    it("should fail to init if length is not supplied", function() {
        (function() {
          var t = new Ticker();
        }).should.throwError(/^Ticker requires a length/);
    });

  });

  describe("tick()", function() {

    it("should increment progress", function() {
      var t = new Ticker(10);
      for (var i = 1; i <= 9; i++) {
        t.tick();
        t.progress.should.be.exactly(i);
      }
    });

    it("should execute callback on completion", function(done) {
      var t = new Ticker(1, done);
      t.tick();
    });

  });

  describe("elongate()", function() {

    it("should increase length by the specified amount", function() {
      for (var i = 1; i <= 10; i++) {
        var t = new Ticker(1);
        for (var j = 1; j <= 10; j++) {
          t.elongate(i);
          t.length.should.be.exactly(j * i + 1);
        }
      }
    });

    it("should default to an increase of 1", function() {
      var t = new Ticker(1);
      for (var i = 1; i <= 10; i++) {
        t.elongate();
        t.length.should.be.exactly(i + 1);
      }
    });

  });


});
