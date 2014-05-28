#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var scrape = require('../lib/scrape.js').scrape;

program
  .version('0.1.2')
  .option('-u, --url <url>', 'URL to scrape')
  .option('-s, --scraper <path>', 'Path to scraper definition (in JSON format)')
  .option('-o, --output <path>', 'Where to output results (directory will created if it doesn\'t exist', 'output')
  .parse(process.argv);

if (!program.url) {
  console.log('ERROR: You must provide a URL to scrape');
  process.exit(1);
}

if (!program.scraper) {
  console.log('ERROR: You must provide a scraper definition');
  process.exit(1);
}

console.log('\nquickscrape launched with...\n');
console.log('  URL: ' + program.url);
console.log('  Scraper definition: ' + program.scraper + '\n');

// load the scraper definition
fs.readFile(program.scraper, 'utf8', function (err, data) {
  if (err) {
    console.log('ERROR: failed to load scraper definition');
    console.log(err);
    process.exit(1);
  }
 
  var definition = JSON.parse(data);
  check_run(definition);
 });

var finish = function() {
  console.log('scraping completed');
  process.exit(0);
}

var check_run = function(definition) {
  // check definition
  if (definition.url) {
    var regex = new RegExp(definition.url, 'i');
    if (program.url.match(regex)) {
      console.log('definition URL matches');
    } else {
      console.log('ERROR: definition URL does not match target URL');
      process.exit(1);
    }
  } else {
    console.log('ERROR: scraper definition must specify URL(s)');
  }

  // create output directory
  if (!fs.existsSync(program.output)) {
    fs.mkdirSync(program.output);
  }
  process.chdir(program.output);

  // run scraper
  scrape(program.url, definition.elements, finish);
}