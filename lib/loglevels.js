var log = module.exports;

log.levels = {
  silly: 0,
  input: 1,
  verbose: 2,
  prompt: 3,
  debug: 4,
  data: 5,
  info: 6,
  help: 7,
  warn: 8,
  error: 9
};

log.colors = {
  silly: 'magenta',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  debug: 'blue',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  error: 'red'
};
