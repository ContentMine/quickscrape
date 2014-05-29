var download = require('download');

var dl = module.exports;

// Download a resource to disk. If the URL is relative,
// it will be converted to an absolute first using the
// page URL.
// @param {String} url the URL of the resource to download
// @param {String} pageUrl the URL of the page on which the link occured
// @return {EventEmitter} an event emitter
dl.downloadResource = function(url, pageUrl) {
  if (url && !/^(f|ht)tps?:\/\//i.test(url)) {
    // relative URL
    url = relativeToAbsolute(url, pageUrl);
  } else if (!url) {
    throw(new Error('downloadResource was passed a NULL URL'));
  }
  return download(url, '.');
}
