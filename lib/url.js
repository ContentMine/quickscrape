var url = module.exports;

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
  } else if (/^file:\/\/\/?/i.test(path)) {
    // local path
    var relative = path.replace(/^file:\/\/\/?/gi, '');
    return relativeToAbsolute(relative, pageUrl);
  }
}


// Get the base URL from a URL
// @param {String} url the URL
// @return {String} the base URL
url.getBase = function(url) {
  var splitUrl = url.split('/');
  return splitUrl.slice(0, splitUrl.length - 2).join('/');
}

// Convert a relative URL to an absolute
// @param {String} relative the relative URL to convert
// @param {String} current the URL to which `relative` is relative
// @return {String} the converted URL
url.relativeToAbsolute = function(relative, current) {
  return [getURLbase(current), relative].join('/');
}
