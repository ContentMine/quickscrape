var scrape = require('../lib/scrape.js');
var should = require('should');

describe("scrape", function() {

  describe(".checkurl()", function() {

    it("should reject an invalid URL", function() {
      var urls = ["http://nsnkfnaksfasfkn33",
                  "blereehahsd.9:1",
                  "fake://url"];
      for (var i in urls) {
        var url = urls[i];
        should(scrape.checkurl(url)).throw(/^malformed URL/);
      }
    });

    it("should accept a valid URL", function() {
      var urls = ["http://realaddress.com",
                  "https://peerj.com/article/123",
                  "ftp://ncbi.org"];
      for (var i in urls) {
        var url = urls[i];
        scrape.checkurl(url).should.be.true;
      }
    });

  });

  describe(".checkdefinition()", function() {

    it("should reject a malformed definition", function() {
      var defs = [{ elements: {} },
                  { url: '.*' },
                  {}];
      for (var url in urls) {
        scrape.scrape(url, def).should.throwError('malformed URL');
      }
    });

    it("should accept a well formed definition", function() {
      var defs = [{
        url: "\\.*",
        elements: { }
      }];
      for (var url in urls) {
        scrape.scrape(url, def).should.throwError('malformed URL');
      }
    });

  });
  
  describe(".scrape()", function() {

    it("should fail gracefully when a connection can't be made", function() {

    });

    it("should extract simple XPaths", function() {

    });

    it("should download resources", function() {

    });

    it("should extract specified attributes", function() {

    });

    it("should handle multiple selector hits", function() {

    });

    it("should callback on completion", function() {

    });

  });

});