#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var scrape = require('../lib/scrape.js').scrape;
var winston = require('winston');
var which = require('which').sync;
var scraperJSON = require('../lib/scraperJSON.js');


program
  .version('0.1.3')
  .option('-u, --url <url>',
          'URL to scrape')
  .option('-r, --urllist <path>',
          'path to file with list of URLs to scrape (one per line)')
  .option('-s, --scraper <path>',
          'path to scraper definition (in JSON format)')
  .option('-o, --output <path>',
          'where to output results ' +
          '(directory will be created if it doesn\'t exist',
          'output')
  .option('-r, --ratelimit <int>',
          'maximum number of scrapes per minute (default 3)', 3)
  .option('-l, --loglevel <level>',
          'amount of information to log ' +
          '(silent, verbose, info*, data, warn, error, or debug)',
          'info')
  .parse(process.argv);

if (!(program.url || program.urllist)) {
  winston.error('You must provide a URL or list of URLs to scrape');
  process.exit(1);
}

if (!program.scraper) {
  winston.error('You must provide a scraper definition');
  process.exit(1);
}

var loglevels = ['silent', 'verbose', 'info', 'data',
                 'warn', 'error', 'debug'];
if (loglevels.indexOf(program.loglevel) == -1) {
  winston.error('Loglevel must be one of: ',
                'quiet, verbose, data, info, warn, error, debug');
  process.exit(1);
}

log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: program.loglevel })
  ]
});
log.cli();

// check dependencies are installed
['phantomjs', 'casperjs'].forEach(function(x) {
  try {
    var path = which(x);
  } catch(e) {
    var helpurl = 'https://github.com/ContentMine/quickscrape';
    var msg = 'No' + x + ' installation found.' +
              'See installation instructions at ' + helpurl;
    throw new Error(msg);
  }
  log.debug(x + ' installation found at ' + path);
});

log.info('quickscrape launched with...');
if (program.url) {
  log.info('- URL: ' + program.url);
} else {
  log.info('- URLs from file: ' + program.urls);
}
log.info('- Scraper:', program.scraper);
log.info('- Rate limit:', program.ratelimit, 'per minute');
log.info('- Log level:', program.loglevel);

// load list of URLs from a file
var loadUrls = function(path) {
  var list = fs.readFileSync(path, {
    encoding: 'utf8'
  });
  return list.split('\n').map(function(cv) {
    return cv.trim();
  });
}

urllist = program.url ? [program.url] : loadUrls(program.urllist);
log.info(urllist.length, 'urls to scrape');

// load the scraper definition
var rawdef = fs.readFileSync(program.scraper, 'utf8');
var definition = JSON.parse(rawdef);

// check definition
scraperJSON.checkDefinition(definition);

// this is the callback we pass to the scraper, so the program
// can exit when all asynchronous file and download tasks have finished
var finish = function() {
  log.info('all tasks completed');
  // process.exit(0);
}

// create output directory
if (!fs.existsSync(program.output)) {
    log.debug('creating output directory: ' + program.output);
    fs.mkdirSync(program.output);
}
process.chdir(program.output);
tld = process.cwd();

// set up crude rate-limiting
mintime = 60000 / program.ratelimit;
lasttime = new Date().getTime();

// synchronously process a URL
var processUrl = function(url, definition, finish,
                          loglevel) {
  log.info('processing URL:', url);
  try {
    // url-specific output dir
    var dir = url.replace(/\/+/g, '_').replace(/:/g, '');
    if (!fs.existsSync(dir)) {
        log.debug('creating output directory: ' + dir);
        fs.mkdirSync(dir);
    }
    process.chdir(dir);
    // run scraper
    scrape(url, definition.elements, finish, loglevel);
    process.chdir(tld);
  } catch(e) {
    log.error(e);
    log.error(e.trace);
  }
}

// perform a rate-limited loop over the urls using
// (algorithmically, not actually) recursive
// setTimeOut callbacks
var processNext = function(i, definition, finish,
                           loglevel) {
  if (i == urllist.length) {
    return;
  }
  if (i == 0) {
    var timeleft = 0;
  } else {
    // rate-limit
    var now = new Date().getTime();
    var diff = now - lasttime;
    lasttime = now;
    var timeleft = Math.max(mintime - diff, 0);
    log.info('waiting', timeleft/1000, 'seconds before next scrape');
  }
  var nextUrl = urllist[i];
  setTimeout(function() {
    processUrl(nextUrl, definition,
               finish, loglevel);
    processNext(i + 1, definition, finish, loglevel);
  }, timeleft + 1000);
}

processNext(0, definition, finish, program.loglevel)
