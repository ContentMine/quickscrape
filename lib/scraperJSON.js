var sj = module.exports;

sj.checkDefinition = function(def, elementsOnly) {
  var problems = [];
  if (elementsOnly) {
    def = {
      elements: def
    };
  }
  // url key must exist
  if (!elementsOnly && !def.hasOwnProperty('url')) {
    problems.push('must have "url" key');
  }
  // elements key must exist
  if(!elementsOnly && !def.hasOwnProperty('elements')) {
    problems.push('must have "elements" key');
  } else {
    // there must be at least 1 element
    if (def['elements'].length == 0) {
      problems.push('no elements were defined');
    } else {
      // each element much have a selector
      var elements = def['elements'];
      for (k in elements) {
        var e = elements[k];
        if (!e.hasOwnProperty('selector')) {
          problems.push('element ' + k + ' has no selector');
        }
      }
    }
  }
  if (problems.length > 0) {
    throw new Error('invalid ScraperJSON definition: \n' + problems.join('\n'));
  }
  log.debug('scraperJSON definition is valid');
  return true;
}
