var ep = require('../lib/eventparse.js')
  , should = require('should');

describe("eventparse", function() {

  describe("compose()", function() {

    it("should compose a message with all relevant info", function() {
      var event = 'scraper.downloadStarted'
        , var1 = 'file.txt'
        , var2 = 'http://place.com';
      msg = ep.compose(event, var1, var2);
      msg.should.match(/scraper/);
      msg.should.match(/download started/);
      msg.should.match(RegExp(var1));
      msg.should.match(RegExp(var2));
    });

  });

});
