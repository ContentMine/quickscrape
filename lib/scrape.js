// SpookyJS provides our bridge to CasperJS and PhantomJS
try {
  var Spooky = require('spooky');
} catch (e) {
  var Spooky = require('../lib/spooky');
}
// xmldom lets us re-render the DOM from raw HTML
var dom = require('jsdom').jsdom;
// xpath lets us use xpath selectors on the rendered DOM
var xpath = require('xpath');
// filesystem manipulation
var fs = require('fs');
// asynchronous file downloading
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
    console.log(e);
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
var handleFileError = function(err) {
  if (err) {
    var e = new Error('Failed writing to file');
    e.details = err;
    console.log(e);
  }
}

// Scrape the provided URL using the specified definition.
//
// @param {String} url the URL to scrape
// @param {Object} definition a dictionary defining the scraper
// @param {Function} cb callback to run once this scrape has finished
// @return {Object} a dictionary containing the scraping results
var scrape = function(url, definition, cb) {

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
    handleHtml(html, definition, url, cb);
  });

  spooky.on('console', function (line) {
    console.log(line);
  });

  spooky.on('log', function (log) {
    if (log.space === 'remote') {
      console.log(log.message.replace(/ \- .*/, ''));
    }
  });
};

// Parse the rendered HTML using the scraper definition.
// Downloadable resources are saved to disk, and the successfully
// parsed elements are output as JSON.
//
// @param {String} html the HTML source of the rendered page
// @param {Object} definition the scraper definition
var handleHtml = function(html, definition, url, cb) {
  console.log('page downloaded and rendered');

  // sync point for downloads and file writes
  var tasksdone = 0;
  // initialise with 2 (rendered and results). this allows the asynchronous
  // tasks to accumulate, and only once the result file write has been
  // launched can the queue possibly end.
  var taskcount = 2;

  // save the rendered html
  fs.writeFile('rendered.html', html, function(err) {
    handleFileError(err);
    // callback if this is the last task to finish
    tasksdone ++;
    if (tasksdone == taskcount) {
      cb();
    }
  });

  // load HTML into DOM
  console.log('scraping rendered DOM');
  var doc = new dom(html);
  results = [];
  downloads = [];

  // process all captures in the definition
  for (var key in definition) {
    try {
      var element = definition[key];
      console.log('----');
      
      // extract element
      var selector = element.selector;
      var attribute = element.attribute;
      var matches = xpath.select(selector, doc);
      for (var i = 0; i < matches.length; i++) {
        var res = matches[i];
        if (res) {
          if (!attribute || attribute == 'text') {
            res = res.textContent;
          } else if (attribute == 'html') {
            res = res.innerHTML;
          } else {
            res = res[attribute];
          }
          console.log(key + ": " + res);

          // save the result
          var data = {};
          data[key] = res;
          results.push(data);

          // process downloads
          if (element.download) {
            console.log('element specifies downloadable resource; ' +
                        'downloading asynchronously');
            // set download running
            var dl = downloadresource(res, url);
            // add it to the task queue
            taskcount ++;
            for (msg in ['close', 'error']) {
              dl.on(msg, function() {
                // callback if this is the last task to finish
                console.log('download done')
                tasksdone ++;
                if (tasksdone == taskcount) {
                  cb();
                }
              });
            }
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

  // save results JSON
  fs.writeFile('results.json', JSON.stringify(results), function(err) {
    handleFileError(err);
    // callback if this is the last task to finish
    tasksdone ++;
    if (tasksdone == taskcount) {
      cb();
    }
  });
}

// Download a resource to disk
var downloadresource = function(url, pageurl) {
  // separate the URL into base and resource
  if (url && !/^(f|ht)tps?:\/\//i.test(url)) {
    // relative URL
    var spliturl = pageurl.split('/');
    var base = spliturl.slice(0, spliturl.length - 2).join('/');
    var resource = url;
    url = [base, resource].join('/');
  } else if (!url) {
    throw(new Error('downloadresource was passed a NULL URL'));
  }
  return download(url, '.');
}

module.exports.scrape = scrape;