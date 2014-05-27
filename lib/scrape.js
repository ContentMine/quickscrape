// spookyJS provides our bridge to CasperJS and PhantomJS
try {
  var Spooky = require('spooky');
} catch (e) {
  var Spooky = require('../lib/spooky');
}
// jsdom lets us re-render the DOM from raw HTML
var dom = require('jsdom').jsdom;
// jsdom-xpath lets us use xpath selectors on the rendered DOM
var xpath = require('jsdom-xpath');
var sleep = require('sleep').sleep;
var fs = require('fs');
var download = require('download');

// Bubble SpookyJS errors up to our interface,
// providing a clear context message and the SpookyJS message
// as detail.
//
// @param {String} err the SpookyJS error.
var handleInitError = function(err) {
  if (err) {
    var e = new Error('Failed to initialize SpookyJS');
    e.details = err;
    throw e;
  }
};

// SpookyJS settings.
var settings = {
  child: {
    transport: 'http'
  },
  casper: {
    logLevel: 'debug',
    verbose: true,
    exitOnError: false
  }
};

// Error-bubbling callback for file writing
var write_callback = function(err, written, buffer) {
  if (err) {
    var e = new Error('Failed writing to file');
    e.details = err;
    throw e;
  }
}

// Scrape the provided URL using the specified definition.
//
// @param {String} url the URL to scrape
// @param {Object} definition a dictionary defining the scraper
// @return {Object} a dictionary containing the scraping results
var scrape = function(url, definition) {

  var spooky = new Spooky(settings, function() {
    spooky.start(url);

    var html = null;

    spooky.then(function() {
      // in SpookyJS scope
      this.emit('pagedownload', this.evaluate(function() {
        // in rendered page scope
        return document.all[0].outerHTML;
      }));

    });

    spooky.run();
  });

  spooky.on('pagedownload', function(html) {
    handlehtml(html, definition);
  });

  spooky.on('console', function (line) {
    console.log(line);
  });

  spooky.on('log', function (log) {
    if (log.space === 'remote') {
      console.log(log.message.replace(/ \- .*/, ''));
    }
  });

  // this is what happens when you have to make a quick script :`(
};

// Parse the rendered HTML using the scraper definition.
// Downloadable resources are saved to disk, and the successfully
// parsed elements are output as JSON.
//
// @param {String} html the HTML source of the rendered page
// @param {Object} definition the scraper definition
var handlehtml = function(html, definition) {
  console.log('page downloaded and rendered');
  fs.writeFile('rendered.html', html);

  console.log('scraping rendered DOM');
  // load HTML into DOM
  var doc = new dom(html);
  results = [];

  // process all captures in the definition
  for (var key in definition) {
    try {
      var element = definition[key];
      console.log('----');
      
      // extract element
      var selector = element.selector;
      var property = element.property || 'text';
      var matches = xpath(selector, doc);
      for (var i = 0; i < matches.length; i++) {
        var res = matches[i][property];
        if (res) {
          console.log(key + ": " + res);

          // save the result
          var data = {};
          data[key] = res;
          results.push(data);

          // process downloads
          if (element.download) {
            console.log('element specifies downloadable resource; ' +
                        'downloading asynchronously');
            downloadresource(res);
          }
        } else {
          console.log('could not capture element');
        }
      }
    } catch(err) {
      // errors deep in the stack should be presented, but
      // we want to continue with the rest of the execution
      console.log(err);
    }
  }

  try {
    fs.writeFile('results.json', JSON.stringify(results), write_callback);
    console.log('page successfully scraped!');
  } catch(err) {
    console.log(err);
  }
}

// Download a resource to disk
var downloadresource = function(url) {
  var dl = download(url, '.');
  dl.on('error', function(err) {
    var e = new Error('download of ' + url + 'failed');
    e.details = err;
    throw e;
  })
}

module.exports.scrape = scrape;