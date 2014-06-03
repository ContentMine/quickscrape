var dom = require('../lib/dom.js');
var should = require('should');
var fs = require('fs');

describe("dom", function() {

  describe(".render()", function() {

    it("should render a DOM from valid HTML", function(done) {
      fs.readFile(__dirname + '/data/tiny.html', function(err, data) {
        if (err) throw err;
        var doc = dom.render(data);
        doc.should.be.ok;
        doc.childNodes[1].tagName.should.equal('HTML');
        done();
      });
    });

  });

  describe(".cleanElement()", function() {

    it("should strip multi-spaces", function() {
      var txt = "this    is    very      spacy";
      var res = "this is very spacy";
      dom.cleanElement(txt).should.equal(res);
    });

    it("should strip newlines", function() {
      var txt = "wow\n\nsuch\n\n\n\nnewlines!";
      var res = "wow such newlines!"
      dom.cleanElement(txt).should.equal(res);
    });

    it("should trim leading and trailing spaces", function() {
      var txt = "    hey, what are the sides doing all the way over there?   ";
      var res = "hey, what are the sides doing all the way over there?";
      dom.cleanElement(txt).should.equal(res);
    });

  });

  // describe(".getAttribute()", function() {
  //
  //   it("should extract standard DOM attribute", function() {
  //     fs.readFile(__dirname + '/data/tiny.html', function(err, data) {
  //       if (err) throw err;
  //       var html = dom.render(data).childNodes[1];
  //       var attr = dom.getAttribute(html, 'xmlns');
  //       attr.should.equal('http://www.w3.org/1999/xhtml');
  //     });
  //   });
  //
  //   it("should extract special `text` attribute", function() {
  //     fs.readFile(__dirname + '/data/tiny.html', function(err, data) {
  //       if (err) throw err;
  //       var html = dom.render(data);
  //       var attr = dom.getAttribute(html, 'text')
  //       attr.should.equal('My First Heading My first paragraph.');
  //     });
  //   });
  //
  //   it("should extract special `html` attribute", function() {
  //     fs.readFile(__dirname + '/data/tiny.html', function(err, data) {
  //       if (err) throw err;
  //       var html = dom.render(data).childNodes[1];
  //       dom.getAttribute(html, 'html')
  //          .should.equal(data);
  //     });
  //   });
  //
  // });

  describe(".select()", function() {

    it("should select a lone element", function(done) {
      fs.readFile(__dirname + '/data/tiny2.html', function(err, data) {
        if (err) throw err;
        var doc = dom.render(data);
        var sel = dom.select('//input[@name="firstname"]', doc);
        sel.length.should.be.exactly(1);
        sel[0]['type'].should.equal('text');
        done();
      });
    });

    it("should select multiple elements", function(done) {
      fs.readFile(__dirname + '/data/tiny2.html', function(err, data) {
        if (err) throw err;
        var doc = dom.render(data);
        var sel = dom.select('//input[@type="text"]', doc);
        sel.length.should.be.exactly(2);
        done();
      });
    });

    it("should fail to select nonexistent elements", function(done) {
      fs.readFile(__dirname + '/data/tiny2.html', function(err, data) {
        if (err) throw err;
        var doc = dom.render(data);
        var sel = dom.select('//input[@class="notreal"]', doc);
        sel.length.should.be.exactly(0);
        done();
      });
    });

  });

});
