#!/usr/bin/env node

var program = require('commander')
  , fs = require('fs')
  , winston = require('winston')
  , which = require('which').sync
  , path = require('path')
  , thresher = require('thresher')
  , Thresher = thresher.Thresher
  , ScraperBox = thresher.ScraperBox
  , Scraper = thresher.Scraper
  , ep = require('../lib/eventparse.js')
  , loglevels = require('../lib/loglevels.js')
  , outformat = require('../lib/outformat.js');


var pjson = require('../package.json');
QSVERSION =  pjson.version;

program
  .version(pjson.version)
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
  .option('-i, --ratelimit <int>',
          'maximum number of scrapes per minute (default 3)', 3)
  .option('-h --headless',
          'render all pages in a headless browser')
  .option('-l, --loglevel <level>',
          'amount of information to log ' +
          '(silent, verbose, info*, data, warn, error, or debug)',
          'info')
  .option('-f, --outformat <name>',
          'JSON format to transform results into (currently only bibjson)')
  .option('-f, --logfile <filename>',
          'save log to specified file in output directory as well as printing to terminal')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}

// set up logging
var allowedlevels = Object.keys(loglevels.levels);
if (allowedlevels.indexOf(program.loglevel) == -1) {
  winston.error('Loglevel must be one of: ',
                'quiet, verbose, data, info, warn, error, debug');
  process.exit(1);
}

log = new (winston.Logger)({
  transports: [new winston.transports.Console({
    level: program.loglevel,
    levels: loglevels.levels,
    colorize: true
  })],
  level: program.loglevel,
  levels: loglevels.levels,
  colorize: true
});
winston.addColors(loglevels.colors);

// create output directory
if (!fs.existsSync(program.output)) {
    log.debug('creating output directory: ' + program.output);
    fs.mkdirSync(program.output);
}
process.chdir(program.output);
tld = process.cwd();

if (program.hasOwnProperty('logfile')) {
  log.add(winston.transports.File, {
    filename: program.logfile,
    level: 'debug'
  });
  log.info('Saving logs to ./' + program.output + '/' + program.logfile);
}

// verify arguments
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

if (program.outformat) {
  if (!program.outformat.toLowerCase() == 'bibjson') {
    log.error('Outformat ' + program.outformat + ' is not valid.');
  }
}

// log options
log.info('quickscrape ' + QSVERSION + ' launched with...');
if (program.url) {
  log.info('- URL: ' + program.url);
} else {
  log.info('- URLs from file: ' + program.urls);
}
if (program.scraper) {
  program.scraper = path.resolve(program.scraper);
  log.info('- Scraper:', program.scraper);
}
if (program.scraperdir) {
  program.scraperdir = path.resolve(program.scraperdir);
  log.info('- Scraperdir:', program.scraperdir);
}
log.info('- Rate limit:', program.ratelimit, 'per minute');
log.info('- Log level:', program.loglevel);

// check scrapers
if (program.scraperdir) {
  var scrapers = new ScraperBox(program.scraperdir);
  if (scrapers.scrapers.length == 0) {
    log.error('the scraper directory provided did not contain any ' +
              'valid scrapers');
    exit(1);
  }
}
if (program.scraper) {
  var definition = fs.readFileSync(program.scraper);
  var scraper = new Scraper(JSON.parse(definition));
  if (!scraper.valid) {
    scraper.on('definitionError', function(problems) {
      log.error('the scraper provided was not valid for the following reason(s):');
      problems.forEach(function(p) {
        log.error('\t- ' + p);
      });
      exit(1);
    });
    scraper.validate(definition);
  }
}

// load list of URLs from a file
var loadUrls = function(path) {
  var list = fs.readFileSync(path, {
    encoding: 'utf8'
  });
  return list.split('\n').map(function(cv) {
    return cv.trim();
  }).filter(function(x) {
    return x.length > 0;
  });
}

urllist = program.url ? [program.url] : loadUrls(program.urllist);
log.info('urls to scrape:', urllist.length);

// this is the callback we pass to the scraper, so the program
// can exit when all asynchronous file and download tasks have finished
var finish = function() {
  log.info('all tasks completed');
  process.exit(0);
}

// set up crude rate-limiting
mintime = 60000 / program.ratelimit;
lasttime = new Date().getTime();

done = false;
next = 0;

var checkForNext = function() {
  var now = new Date().getTime();
  var diff = now - lasttime;
  var timeleft = Math.max(mintime - diff, 0);
  if (timeleft == 0 && done) {
    next ++;
    if (next < urllist.length) {
      lasttime = new Date().getTime();
      processUrl(urllist[next]);
      if (next == urllist.length - 1) {
        finish();
      }
    } else {
      finish();
    }
  } else if (done) {
    if (next == urllist.length - 1) {
      finish();
    }
  }
}

// process a URL
var processUrl = function(url) {
  done = false;
  log.info('processing URL:', url);

  // load the scraper definition(s)
  var scrapers = new ScraperBox(program.scraperdir);
  if (program.scraper) {
    scrapers.addScraper(program.scraper);
  }
  if (scrapers.scrapers.length == 0) {
    log.warn('no scrapers ')
    return;
  }

  // url-specific output dir
  var dir = url.replace(/\/+/g, '_').replace(/:/g, '');
  dir = path.join(tld, dir);
  if (!fs.existsSync(dir)) {
    log.debug('creating output directory: ' + dir);
    fs.mkdirSync(dir);
  }
  process.chdir(dir);

  // run scraper
  var capturesFailed = 0;
  var t = new Thresher(scrapers);

  t.on('scraper.*', function(var1, var2) {
    log.log(ep.getlevel(this.event),
            ep.compose(this.event, var1, var2));
  });

  t.on('scraper.elementCaptureFailed', function() {
    capturesFailed += 1;
  })

  t.on('scraper.renderer.*', function(var1, var2) {
    log.info(this.event, var1, var2)
  });

  t.once('result', function(result, structured) {
    var nresults = Object.keys(result).length
    log.info('URL processed: captured ' + (nresults - capturesFailed) + '/' +
             nresults + ' elements (' + capturesFailed + ' captures failed)');
    outfile = 'results.json'
    log.debug('writing results to file:', outfile)
    fs.writeFileSync(outfile, JSON.stringify(structured, undefined, 2));
    // write out any extra formats
    if (program.outformat) {
      outformat.format(program.outformat, structured);
    }
    log.debug('changing back to top-level directory');
    process.chdir(tld);

    // if we don't remove all the listeners, processing more URLs
    // will post messages  to all the listeners from previous URLs
    t.removeAllListeners();
    t = null;

    done = true;
  });

  t.scrape(url, program.headless);
}

setInterval(checkForNext, 100);
processUrl(urllist[0]);
