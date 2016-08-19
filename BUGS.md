# bugs

most bugs should be reported the the issues. However some are created by other pacakges such as Spooky and require 
per-installation workarounds 

### quickscrape/tiny-jsonrpc bug

The details will differ according to where `node` is installed. Here's PMR's:
```
Error: Cannot find module '/usr/local/n/versions/node/6.2.1/lib/node_modules/quickscrape/node_modules/spooky/lib/../node_modules/tiny-jsonrpc/lib/tiny-jsonrpc' so moving on to next url in list
Unsafe JavaScript attempt to access frame with URL about:blank from frame with URL file:///usr/local/n/versions/node/6.2.1/lib/node_modules/quickscrape/node_modules/casperjs/bin/bootstrap.js. Domains, protocols and ports must match.
/usr/local/n/versions/node/6.2.1/lib/node_modules/quickscrape/node_modules/eventemitter2/lib/eventemitter2.js:290
          throw arguments[1]; // Unhandled 'error' event
          ^

Error: Child terminated with non-zero exit code 1
    at Spooky.<anonymous> (/usr/local/n/versions/node/6.2.1/lib/node_modules/quickscrape/node_modules/spooky/lib/spooky.js:210:17)
    at emitTwo (events.js:106:13)
    at ChildProcess.emit (events.js:191:7)
    at Process.ChildProcess._handle.onexit (internal/child_process.js:204:12)
```
find where your quickscrape is:
```
which quickscrape
gives:
/usr/local/n/versions/node/6.2.1/bin/quickscrape
create the top level dir 
/usr/local/n/versions/node/6.2.1/
other might have 
/home/$USER/.nvm/versions/node/v6.3.1

```
then copy files from the `lib` directory (after adjusting)
```
cd /usr/local/n/versions/node/6.2.1/lib/node_modules/quickscrape/
cp -r node_modules/tiny-jsonrpc node_modules/spooky/node_modules
```
