var fs = require('fs');

var file = module.exports;

// Handle errors in file writing
//
// @param {Error} err a file error
// @param {String} filename the filename that was being written
var handleFileError = function(err, filename) {
  if (err) {
    var e = new Error('Failed writing to file: ' + filename);
    e.details = err;
    console.log(e);
  }
}

// Synchronously write a string to file
//
// @param {String} filename the filename to write to
// @param {String} str the string to write
// @param {Function} cb callback to run on completion
file.write = function(filename, str, cb) {
  log.debug('writing file: ' + filename);
  fs.writeFile(filename, str, function(err, filename) {
    handleFileError(err);
    cb();
  });
}
