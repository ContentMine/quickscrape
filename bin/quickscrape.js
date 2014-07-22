#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var winston = require('winston');
var which = require('which').sync;
var path = require('path');
var thresher = require('thresher');
var Thresher = thresher.Thresher;
var ScraperBox = thresher.scraperbox;
var Thresher = thresher.Thresher;

program
  .version('0.2.6')
  .option('-u, --url <url>',
          'URL to scrape')
  .option('-r, --urllist <path>',
          'path to file with list of URLs to scrape (one per line)')
  .option('-s, --scraper <path>',
          'path to scraper definition (in JSON format)')
  .option('-d, --scraperdir <path>',
          'path to directory containing scraper definitions (in JSON format)')
  .option('-o, --output <path>',
          'where to output results ' +
          '(directory will be created if it doesn\'t exist',
          'output')
  .option('-r, --ratelimit <int>',
          'maximum number of scrapes per minute (default 3)', 3)
  .option('-h --headless',
          'render all pages in a headless browser')
  .option('-l, --loglevel <level>',
          'amount of information to log ' +
          '(silent, verbose, info*, data, warn, error, or debug)',
          'info')
  .parse(process.argv);

// set up logging
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

if (program.scraper && program.scraperdir) {
  log.error('Please use either --scraper or --scraperdir, not both');
  process.exit(1);
}

if (!(program.url || program.urllist)) {
  log.error('You must provide a URL or list of URLs to scrape');
  process.exit(1);
}

if (!(program.scraper || program.scraperdir)) {
  log.error('You must provide a scraper definition');
  process.exit(1);
}

log.info('quickscrape launched with...');
if (program.url) {
  log.info('- URL: ' + program.url);
} else {
  log.info('- URLs from file: ' + program.urls);
}
if (program.scraper) {
  log.info('- Scraper:', program.scraper);
}
if (program.scraperdir) {
  log.info('- Scraperdir:', program.scraperdir);
}
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
log.info('urls to scrape:', urllist.length);

// load the scraper definition(s)
var scrapers = new ScraperBox(program.scraperdir);
if (program.scraper) {
  scrapers.addScraper(program.scraper);
}

// this is the callback we pass to the scraper, so the program
// can exit when all asynchronous file and download tasks have finished
var finish = function() {
  log.info('all tasks completed');
  process.exit(0);
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

// asynchronously process a URL
var processUrl = function(url, scrapers,
                          loglevel, cb) {
  log.info('processing URL:', url);
  var definition = scrapers.getScraper(url);
  try {
    // url-specific output dir
    var dir = url.replace(/\/+/g, '_').replace(/:/g, '');
    dir = path.join(tld, dir);
    if (!fs.existsSync(dir)) {
        log.debug('creating output directory: ' + dir);
        fs.mkdirSync(dir);
    }
    process.chdir(dir);
    // run scraper
    var t = new Thresher();
    t.scrape(url, definition.elements, program.headless);
    t.on('end', function() {
      log.debug('changing back to top-level directory');
      process.chdir(tld);
      cb();
    });
  } catch(e) {
    log.error(e);
    log.error(e.stack);
  }
}

// perform a rate-limited loop over the urls using
// (algorithmically, not actually) recursive
// setTimeOut callbacks
var processNext = function(i, scrapers, finish,
                           loglevel) {
  if (i == urllist.length) {
    finish();
  }
  if (i == 0) {
    var timeleft = 0;
  } else {
    // rate-limit
    var now = new Date().getTime();
    var diff = now - lasttime;
    var timeleft = Math.max(mintime - diff, 0);
    log.info('waiting', Math.round(timeleft/1000),
             'seconds before next scrape');
  }
  var nextUrl = urllist[i];
  setTimeout(function() {
    processUrl(nextUrl, scrapers, loglevel, function() {
      lasttime = new Date().getTime();
      processNext(i + 1, scrapers, finish, loglevel);
    });
  }, timeleft + 1000);
}

processNext(0, scrapers, finish, program.loglevel)
