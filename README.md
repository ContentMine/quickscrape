# quickscrape [![Build Status](https://secure.travis-ci.org/ContentMine/quickscrape.png?branch=master)](http://travis-ci.org/ContentMine/quickscrape) [![NPM version](https://badge.fury.io/js/quickscrape.svg)](http://badge.fury.io/js/quickscrape)

Very simple extensible, headless scraping.

`quickscrape` is a simple command-line tool for scraping websites using declarative scraper definitions and a headless browser.

This approach has some benefits compared to existing scraping systems:
- Declarative scraper definitions allows large collections of scrapers to be created with no programming.
- Scraping through a headless browser allows handing off page rendering complexity to the browser, where it belongs. The scraping software sees nice rendered HTML.

Our headless browsing is done by driving [PhantomJS](http://phantomjs.org/) with [CasperJS](http://casperjs.org/) via a node-bridge with [SpookyJS](https://github.com/WaterfallEngineering/SpookyJS).

At the moment, `quickscrape` is limited to scraping a single URL at a time, and expects each XPath to require the `content` tag to be extracted.

**NOTE**: This is pre-alpha software. It works for some very specific test-cases and is under active development. Please wait until we're in beta to report issues.

## Installation

### Quick-start

Install [NodeJS](http://nodejs.org/), [PhantomJS](http://phantomjs.org/) and [CasperJS](http://casperjs.org/), then install the module with: `npm install --global quickscrape`.

### Not-so-quick-start

#### OSX

With [Homebrew](http://brew.sh/), install dependencies:

```
brew update && brew install node phantomjs
brew install casperjs --devel
```

Install quickscrape

`npm install --global quickscrape`

#### Debian

With apt-get, install dependencies:

`apt-get update && apt-get install nodejs phantomjs`

Install final dependency and quickscrape

`npm install --global casperjs quickscrape`

## Documentation

Run `quickscrape --help` from the command line to get help:

```

  Usage: quickscrape [options]

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -u, --url <url>       URL to scrape
    -s, --scraper <path>  Path to scraper definition (in JSON format)
    -o, --output <path>   Where to output results (directory will created if it doesn't exist) [output]

```

You must provide scraper definitions in the format used in the [ContentMine journal-scrapers](https://github.com/ContentMine/journal-scrapers).

## Examples

```bash
// grab some pre-cooked scraper definitions
git clone git@github.com:ContentMine/journal-scrapers.git

// scrape some journal PDFs
quickscrape \
  --url https://peerj.com/articles/384 \
  --scraper journal-scrapers/peerj.json \
  --output peerj-384

quickscrape \
  --url http://www.plosone.org/article/info%3Adoi%2F10.1371%2Fjournal.pone.0098172 \
  --scraper journal-scrapers/plosone.json \
  --output plos-waspfaces
```

## Contributing

We are not yet accepting contributions, if you'd like to help please drop me an email (richard@contentmine.org) and I'll let you know when we're ready for that.

## Release History

- ***0.1.0*** - initial version with simple one-element scraping
- ***0.1.1*** - multiple-member elements; clean exiting; massive speedup

## License
Copyright (c) 2014 Richard Smith-Unna  
Licensed under the MIT license.
