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
    log.error(e);
    log.debug(e.stack);
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
      verbose: true,
      exitOnError: true,
      pageSettings: {
        loadImages: false,
        loadPlugins: false
      }
    }
  };
}

// Scrape a URL using a ScraperJSON-defined scraper.
//
// @param {String} scrapeUrl the URL to scrape
// @param {Object} definition a dictionary defining the scraper
// @param {Function} cb callback to run once this scrape has finished
// @return {Object} a dictionary containing the scraping results
scrape.scrape = function(scrapeUrl, definition, cb, loglevel) {

  // validate arguments
  url.checkUrl(scrapeUrl);

  // let's get our scrape on
  var spooky = new Spooky(settings(loglevel), function() {
    spooky.start(scrapeUrl);

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
    log.debug('page downloaded and rendered');
    try {
      scrape.scrapeHtml(html, definition, scrapeUrl, cb);
    } catch(e) {
      log.error('problem scraping html:');
      log.error(e.message);
      log.error(e.stack);
    }
  });

  if (loglevel == 'debug') {
    spooky.on('console', function (line) {
      var parts = line.split(' ');
      var level = /(info|warn|error|debug|data)/.exec(parts[0])[1];
      log.log(level, parts.slice(1, parts.length).join(' '));
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
scrape.scrapeHtml = function(html, definition, scrapeUrl, cb) {
  var ticker = new Ticker(2);

  // save the rendered html
  log.debug('saving rendered HTML');
  file.write('rendered.html', html, ticker.tick);

  // load HTML into DOM
  log.debug('scraping rendered DOM');
  var doc = dom.render(html);

  // scrape the DOM using the ScraperJSON scraper
  var results = scrape.scrapeScraperJSON(definition,
                                         doc,
                                         scrapeUrl,
                                         cb,
                                         ticker);

  // save results JSON
  file.write('results.json', JSON.stringify(results), ticker.tick);
}

scrape.scrapeScraperJSON =
  function(definition, doc, scrapeUrl, cb, ticker) {
  if (!ticker) {
    ticker = Ticker(0, cb);
  }
  var results = [];

  for (var key in definition) {
    try {
      var element = definition[key];
      log.debug('scraping element: ' + key);
      // extract element
      var selector = element.selector;
      var attribute = element.attribute;
      var matches = dom.select(selector, doc);
      log.debug("found", matches.length, "matches");
      for (var i = 0; i < matches.length; i++) {
        var res = matches[i];
        if (res) {
          res = dom.getAttribute(res, attribute);
          log.data(key, ": ", dom.cleanElement(res));

          // save the result
          var data = {};
          data[key] = res;
          results.push(data);

          // process downloads
          if (element.download) {
            // set download running
            var down = dl.downloadResource(res, scrapeUrl);
            // add it to the task ticker
            ticker.elongate();
            down.on('close', function() {
              log.debug('download done');
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
      if (Ticker.length > 2) {
        console.info('waiting for',
                     Ticker.length - 2,
                     'downloads to complete in background');
      }
    } catch(err) {
      // errors deep in the stack should be presented, but
      // we want to continue with the rest of the execution
      log.error('problem applying scraperJSON scraper:');
      log.error(err.message);
      log.error(err.stack);
    }
  }
  return results;
}
