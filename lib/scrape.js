// SpookyJS provides our bridge to CasperJS and PhantomJS
var Spooky = require('spooky');

var file = require('./file.js')
  , dl = require('./download.js')
  , url = require('./url.js')
  , dom = require('./dom.js')
  , Ticker = require('./ticker.js');

var scrape = module.exports;

// Bubble SpookyJS errors up to our interface,
// providing a clear context message and the SpookyJS message
// as detail.
//
// @param {String} err the SpookyJS error.
var handleInitError = function(err) {
  if (err) {
    var e = new Error('Failed to initialize SpookyJS');
    e.details = err;
    console.log(e);
  }
};

// generate SpookyJS settings
// @param {String} loglevel the loglevel
// @return {Object} the settings
var settings = function(loglevel) {
  return {
    child: {
      transport: 'http'
    },
    casper: {
      logLevel: loglevel,
      verbose: false,
      exitOnError: false,
      pageSettings: {
        loadImages: false,
        loadPlugins: false
      }
    }
  };
}

// Scrape the provided URL using the specified definition.
//
// @param {String} url the URL to scrape
// @param {Object} definition a dictionary defining the scraper
// @param {Function} cb callback to run once this scrape has finished
// @return {Object} a dictionary containing the scraping results
scrape.scrape = function(url, definition, cb, loglevel) {

  var spooky = new Spooky(settings, function() {
    spooky.start(url);

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
    scrapeHtml(html, definition, url, cb);
  });

  if (loglevel == 'debug') {
    spooky.on('console', function (line) {
      console.log(line);
    });

    spooky.on('log', function (log) {
      if (log.space === 'remote') {
        console.log(log.message.replace(/ \- .*/, ''));
      }
    });
  }

};

// Parse the rendered HTML using the scraper definition.
// Downloadable resources are saved to disk, and the successfully
// parsed elements are output as JSON.
//
// @param {String} html the HTML source of the rendered page
// @param {Object} definition the scraper definition
scrape.scrapeHtml = function(html, definition, url, cb) {
  log.info('page downloaded and rendered');

  var ticker = Ticker(2, cb);

  // save the rendered html
  file.write('rendered.html', html, ticker.tick);

  // load HTML into DOM
  log.info('scraping rendered DOM');
  var doc = dom.render(html);

  // scrape the dom using the ScraperJSON scraper
  var results = scrape.scrapeScraperJSON(definition, doc, cb, ticker);

  // save results JSON
  file.write('results.json', JSON.stringify(results), ticker.tick);
}

scrape.scrapeScraperJSON = function(definition, doc, cb, ticker) {
  if (!ticker) {
    ticker = Ticker(0, cb);
  }
  var results = [];

  for (var key in definition) {
    try {
      var element = definition[key];

      // extract element
      var selector = element.selector;
      var attribute = element.attribute;
      var matches = dom.select(selector, doc);
      for (var i = 0; i < matches.length; i++) {
        var res = matches[i];
        if (res) {
          dom.getAttr(res, attribute);
          log.data(key + ": " + cleanElement(res));

          // save the result
          var data = {};
          data[key] = res;
          results.push(data);

          // process downloads
          if (element.download) {
            log.info('element specifies downloadable resource; ' +
                        'downloading asynchronously');
            // set download running
            var down = dl.downloadResource(res, url);
            // add it to the task ticker
            ticker.elongate();
            down.on('close', function() {
              log.info('download done')
              ticker.tick();
            });
            down.on('error', function(err) {
              log.error('file download failed: ' + err);
              ticker.tick();
            });
          }
        } else {
          log.warn('could not capture element');
        }
      }
    } catch(err) {
      // errors deep in the stack should be presented, but
      // we want to continue with the rest of the execution
      log.warn(err);
    }
  }
  return results;
}
