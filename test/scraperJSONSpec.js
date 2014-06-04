var sj = require('../lib/scraperJSON.js');
var should = require('should');
log = {
  info: function(){},
  warn: function(){},
  error: function(){},
  debug: function(){}
};

describe("scraperJSON", function() {

  describe(".checkDefinition()", function() {

    it("should reject a malformed definition", function() {
      var defs = [{ elements: {} },
                  { url: '.*' },
                  { url: '.*',
                    elements: {}
                  },
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

  describe(".checkDefinitionUrl()", function() {

    it("should accept a matching URL", function() {
      var urls = [{ url: 'http://wtf.com',
                    def: 'wtf' },
                  { url: 'ftp://scapecity.fi',
                    def: 'scrapecity\.fi' },
                  { url: 'http://wtf.com',
                    def: 'wtf' }];
      for (var i in urls) {
        var url = urls[i].url;
        var def = urls[i].def;
        sj.checkDefinitionUrl(def, url).should.be.true;
      }
    });

    it("should reject a non-matching URL", function() {
      var urls = [{ url: 'http://wtf.com',
                    def: { url: 'http:\/\/plos.org' } },
                  { url: 'ftp://scapecity.fi',
                    def: { url: 'bloot' } },
                  { url: 'http://wtf.com',
                    def: { url: 'jp\.jp' } }];
      for (var i in urls) {
        var url = urls[i].url;
        var def = urls[i].def;
        var result = sj.checkDefinitionUrl(def, url);
        result.should.be.false;
      }
    });

  });

});
