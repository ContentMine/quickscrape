// tools for rendering the DOM and
// manipulating DOM nodes

// xmldom lets us re-render the DOM from raw HTML
var jsdom = require('jsdom').jsdom;
// xpath lets us use xpath selectors on the rendered DOM
var xpath = require('xpath');

var dom = module.exports;

// Render a DOM from HTML
//
// @param {String} html HTML to render
// @return {Object} the rendered DOM
dom.render = function(html) {
  new dom(html);
}

// Clean up an element by stripping out chains of whitespace
// and newlines.
//
// @param {String} str element text
// @return {String} the cleaned string
dom.cleanElement = function(str) {
  return str.replace(/\s{2,}/mg,' ');
}

// Extract a specified attribute from a node
//
// @param {Node} node the DOM node
// @param {String} attribute the name of to extract
// @return {String} the attribute
dom.getAttribute = function(node, attribute) {
  if (!attribute || attribute == 'text') {
    return res.textContent;
  } else if (attribute == 'html') {
    return res.innerHTML;
  } else {
    return res[attribute];
  }
}

// Select a DOM node matching an XPath selector
//
// @param {String} selector an XPath selector
// @param {Object} dom the DOM to search
// @return {Node} the selected node
dom.select = function(selector, dom) {
  return xpath.select(selector, doc);
}
