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
  .option('-s, --scraper <path>',
          'path to scraper definition (in JSON format)')
  .option('-o, --output <path>',
          'where to output results ' +
          '(directory will created if it doesn\'t exist',
          'output')
  .option('-l, --loglevel <level>',
          'amount of information to log ' +
          '(quiet, info, data, warning, error, or debug)',
          'info')
  .parse(process.argv);

if (!program.url) {
  winston.error('You must provide a URL to scrape');
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

log.info('quickscrape launched with...');
log.info('- URL: ' + program.url);
log.info('- Scraper: ' + program.scraper);
log.info('- Log level: ' + program.loglevel);

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

// load the scraper definition
fs.readFile(program.scraper, 'utf8', function (err, data) {
  if (err) {
    log.error('failed to load scraper definition');
    log.error(err);
    process.exit(1);
  }

  var definition = JSON.parse(data);
  check_run(definition, program.loglevel);
});


// this is the callback we pass to the scraper, so the program
// can exit when all asyncronous file and download tasks have finished
var finish = function() {
  log.info('all tasks completed');
  process.exit(0);
}

var check_run = function(definition, loglevel) {
  // check definition
  scraperJSON.checkDefinition(definition);
  var regex = new RegExp(definition.url, 'i');
  if (program.url.match(regex)) {
    log.debug('definition URL matches');
  } else {
    log.error('definition URL does not match target URL');
    process.exit(1);
  }
  // create output directory
  if (!fs.existsSync(program.output)) {
    log.debug('creating output directory: ' + program.output);
    fs.mkdirSync(program.output);
  }
  process.chdir(program.output);
  // run scraper
  scrape(program.url, definition.elements, finish, loglevel);
}
