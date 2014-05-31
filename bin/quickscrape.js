#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var scrape = require('../lib/scrape.js').scrape;
var winston = require('winston');
var which = require('which').sync;

program
  .version('0.1.3')
  .option('-u, --url <url>',
          'URL to scrape')
  .option('-r, --url-list <path>',
          'path to file with list of URLs to scrape (one per line)')
  .option('-s, --scraper <path>',
          'path to scraper definition (in JSON format)')
  .option('-o, --output <path>',
          'where to output results ' +
          '(directory will be created if it doesn\'t exist',
          'output')
  .option('-l, --loglevel <level>',
          'amount of information to log ' +
          '(quiet, info, data, warning, error, or debug)',
          'info')
  .parse(process.argv);

if (!(program.url || program.urls)) {
  winston.error('You must provide a URL or list of URLs to scrape');
  process.exit(1);
}

if (!program.scraper) {
  winston.error('You must provide a scraper definition');
  process.exit(1);
}

var loglevels = ['info', 'data', 'warning', 'error', 'debug'];
if (loglevels.indexOf(program.loglevel) == -1) {
  winston.error('Loglevel must be one of: quiet, info, warning, error, debug');
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
log.info('- Scraper: ' + program.scraper);
log.info('- Log level: ' + program.loglevel);

// load list of URLs from a file
var loadUrls = function(path) {
  var list = fs.readFileSync(path, {
    encoding: 'utf8'
  });
  return list.split('\n').map(function(cv) {
    return cv.trim();
  });
}

var urls = program.url ? [program.url] : loadUrls(program.urls);
log.info(urls.length, 'urls to scrape');

// load the scraper definition
var rawdef = fs.readFileSync(program.scraper, 'utf8');
console.log(rawdef);
var definition = JSON.parse(rawdef);

// check definition
if (definition.url) {
  var regex = new RegExp(definition.url, 'i');
  if (program.url.match(regex)) {
    log.debug('definition URL matches');
  } else {
    log.error('definition URL does not match target URL');
    process.exit(1);
  }
} else {
  log.error('scraper definition must specify URL(s)');
}

// this is the callback we pass to the scraper, so the program
// can exit when all asyncronous file and download tasks have finished
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
var tld = process.cwd();

// process urls
urls.forEach(function(url) {
  // url-specific output dir
  var dir = url.replace(/\//g, '_').replace(/:/g, '');
  if (!fs.existsSync(dir)) {
      log.debug('creating output directory: ' + dir);
      fs.mkdirSync(dir);
  }
  process.chdir(dir);
  // run scraper
  scrape(program.url, definition.elements, finish, program.loglevel);
  process.chdir(tld);
});
