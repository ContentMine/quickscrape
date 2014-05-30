var url = module.exports;

// Check a URL meets basic validity requirements.
// Return true if the URL is of the form:
// http://domain.tld[/other/parts]
// OR
// https://...
// ftp://...
// Otherwise, raise an Error.
// @param {String} theUrl the URL to validate
url.checkUrl = function(theUrl) {
  var protocol = /^(f|ht)tps?:\/\//i.test(theUrl);
  var domain = /:\/\/\w+\.\w+/i.test(theUrl);
  if (!protocol || !domain) {
    // not a valid URL
    var msg = 'malformed URL: ' + theUrl + '; '
    if (!protocol) {
      msg += 'protocol missing (must include http(s):// or ftp(s)://)'
    }
    if (!domain) {
      if (!protocol) {
        msg += ', '
      }
      msg += 'domain missing'
    }
    var e = new Error(msg);
    throw e;
  }
  return true;
}

// Convert a file:/// url to an absolute remote URL.
//
// Rendering pages locally sometimes adds a spurious
// 'file:///' to the beginning of relative resource paths.
// This function strips the 'file:///' and constructs an
// absolute url.
//
// @param {String} path resource path to clean
// @param {String} pageUrl URL of the page the resource was linked from
url.cleanResourcePath = function(path, pageUrl) {
  if (/^(f|ht)tps?:\/\//i.test(path)) {
    // already absolute
    return path;
  } else if (/^file:\/\/\/?/i.test(path) ||
            (/^\//.test(path))) {
    // root relative path
    var relative = path.replace(/^(file:)?\/+/gi, '');
    var root = url.getRoot(pageUrl);
    return [root, relative].join('/');
  } else {
    return url.relativeToAbsolute(path, pageUrl);
  }
}

// Get the base URL from a URL
// @param {String} fullUrl the URL
// @return {String} the base URL
url.getBase = function(fullUrl) {
  var splitUrl = fullUrl.split('://');
  if (splitUrl.length > 1 && splitUrl[1].split('/').length == 1) {
    // naked domain - return unchanged
    return fullUrl
  }
  splitUrl = fullUrl.split('/');
  return splitUrl.slice(0, splitUrl.length - 1).join('/');
}

// Get the root URL from a URL
// @param {String} fullUrl the URL
// @return {String} the root URL
url.getRoot = function(fullUrl) {
  var splitUrl = fullUrl.split('/');
  return splitUrl.slice(0, 3).join('/');
}

// Convert a relative URL to an absolute
// @param {String} relative the relative URL to convert
// @param {String} current the URL to which `relative` is relative
// @return {String} the converted URL
url.relativeToAbsolute = function(relative, current) {
  return [url.getBase(current), relative].join('/');
}
