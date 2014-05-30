require("blanket");

var sj = require('../lib/scraperJSON.js');
var should = require('should');

describe("scraperJSON", function() {

  describe(".checkDefinition()", function() {

    it("should reject a malformed definition", function() {
      var defs = [{ elements: {} },
                  { url: '.*' },
                  {},
                  { url: "\\.*",
                    elements: { 'fulltext': {} }
                  }];
      for (var i in defs) {
        var def = defs[i];
        (function() {
          sj.checkDefinition(def);
        }).should.throwError(/^invalid ScraperJSON/);
      }
    });

    it("should accept a well formed definition", function() {
      var defs = [{
        url: "\\.*",
        elements: {
          'fulltext': {
            'selector': '//div'
          }
        }
      }];
      for (var i in defs) {
        var def = defs[i];
        sj.checkDefinition(def).should.be.ok;
      }
    });

  });

});
