var download = require('download');
var url = require('./url.js');

var dl = module.exports;

// Download a resource to disk. If the URL is relative,
// it will be converted to an absolute URL first using the
// page URL.
// @param {String} resUrl the URL of the resource to download
// @param {String} pageUrl the URL of the page on which the link occured
// @return {EventEmitter} an event emitter
dl.downloadResource = function(resUrl, pageUrl) {
  resUrl = url.cleanResourcePath(resUrl, pageUrl);
  log.debug('downloading in background from', resUrl);
  if (resUrl && !/^(f|ht)tps?:\/\//i.test(resUrl)) {
    // relative URL
    resUrl = url.relativeToAbsolute(resUrl, pageUrl);
  } else if (!resUrl) {
    throw new Error('downloadResource was passed a NULL URL');
  }
  return download(resUrl, '.');
}
