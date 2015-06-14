var chalk = require('chalk');

function bracket(x) {
  return chalk.yellow('[') +
         x +
         chalk.yellow(']');
}

var scraper = bracket(chalk.cyan('scraper'))
  , scraperBox = bracket(chalk.magenta('scraperBox'));

var mapping = {
  'error': [],
  'info': [],
  'result': [],
  'end': [],
  'scraper.downloadStarted':
    [scraper, 'download started'],
  'scraper.downloadProgress':
    [scraper, 'download process'],
  'scraper.downloadError':
    [scraper, 'downloading failed'],
  'scraper.fileSaveError':
    [scraper, 'file save failed'],
  'scraper.downloadSaved':
    [scraper, 'download started'],
  'scraper.urlRendered':
    [scraper, 'URL rendered'],
  'scraper.elementCaptured':
    [scraper, 'element captured'],
  'scraper.elementCaptureFailed':
    [scraper, 'element capture failed'],
  'scraper.elementResults':
    [scraper, 'element results'],
  'scraper.selectorFailed':
    [scraper, 'selector had no results'],
  'scraper.attributeFailed':
    [scraper, 'attribute was not valid'],
  'scrapersLoaded':
    [scraperBox, 'scrapers loaded'],
  'gettingScraper':
    [scraperBox, 'getting scraper'],
  'scraperNotFound':
    [scraperBox, 'scraper not found'],
  'scraperFound':
    [scraperBox, 'scraper found'],
  'scrapeStart':
    [scraperBox, 'scraping started']
}

module.exports.getlevel = function(event) {
  if (/\\.error/.test(event)) {
    return 'error';
  } else if (/Error/.test(event)) {
    return 'warning';
  } else if (/elementCapture/.test(event)) {
    return 'data';
  } else if (/elementResults/.test(event)) {
    return 'debug';
  } else if (/Failed/.test(event)) {
    return 'debug';
  }
  return 'info';
}

module.exports.compose = function(event, var1, var2) {
  msg = mapping[event] || [event];
  if (var1)
    msg = msg.concat([var1])
  if (var2)
    msg = msg.concat([var2])
  strmsg = msg.join('. ') + '.';
  return strmsg;
}
