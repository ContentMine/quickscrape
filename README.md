# quickscrape [![NPM version](https://badge.fury.io/js/quickscrape.svg)][npm] [![license MIT](http://b.repl.ca/v1/license-MIT-brightgreen.png)][license] [![Downloads](http://img.shields.io/npm/dm/quickscrape.svg)][downloads] [![Build Status](https://secure.travis-ci.org/ContentMine/quickscrape.png?branch=master)][travis]

[npm]: http://badge.fury.io/js/quickscrape
[travis]: http://travis-ci.org/ContentMine/quickscrape
[coveralls]: https://coveralls.io/r/ContentMine/quickscrape
[gemnasium]: https://gemnasium.com/ContentMine/quickscrape
[license]: https://github.com/ContentMine/quickscrape/blob/master/LICENSE-MIT
[downloads]: https://nodei.co/npm/quickscrape

`quickscrape` is a simple command-line tool for powerful, modern website scraping.

### Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Documentation](#documentation)
- [Examples](#examples)
  - [1. Extract data from a single URL with a predefined scraper](#1-extract-data-from-a-single-url-with-a-predefined-scraper)
- [Contributing](#contributing)
- [Release History](#release-history)
- [License](#license)

### Description

`quickscrape` is not like other scraping tools. It is designed to enable large-scale content mining. Here's what makes it different:

Websites can be rendered in a GUI-less browser ([PhantomJS](http://phantomjs.org) via [CasperJS](http://casperjs.org)). This has some important benefits:

- Many modern websites are only barely specified in their HTML, but are rendered with Javascript after the page is loaded. Headless browsing ensures the version of the HTML you scrape is the same one human visitors would see on their screen.
- User interactions can be simulated. This is useful whenever content is only loaded after interaction, for example when article content is gradually loaded by AJAX during scrolling.
- The full DOM specification is supported (because the backend is WebKit). This means pages with complex Javascripts that use rare parts of the dom (for example, Facebook) can be rendered, which they cannot in most existing tools.

Scrapers are defined in separate JSON files that follow a defined structure ([scraperJSON](https://github.com/ContentMine/scraperJSON)). This too has important benefits:

- No programming required! Non-programmers can make scrapers using a text editor and a web browser with an element inspector (e.g. Chrome).
- Large collections of scrapers can be maintained to retrieve similar sets of information from different pages. For example: newspapers or academic journals.
- Any other software supporting the same format could use the same scraper definitions.

`quickscrape` is being developed to allow the community early access to the technology that will drive [ContentMine](http://contentmine.org), such as [ScraperJSON](https://github.com/ContentMine/journal-scrapers) and our Node.js scraping library [thresher](https://github.com/ContentMine/thresher).

The software is under rapid development, so please be aware there may be bugs. If you find one, please report it on the [issue tracker](https://github.com/ContentMine/quickscrape/issues).

### Installation

#### Prerequisites

You'll need [Node.js](http://nodejs.org) (`node`), a platform which enables standalone JavaScript apps. You'll also need the Node package manager (`npm`), which usually comes with Node.js. Installing Node.js via the operating system's package manager leads to issues. If you already have Node.js installed, and it requires `sudo` to install node packages, that's the wrong way. The easiest way to do it right on Unix systems (e.g. Linux, OSX) is to use NVM, the Node version manager.

First, install NVM:

```bash
curl https://raw.githubusercontent.com/creationix/nvm/v0.24.1/install.sh | bash
```

or, if you don't have `curl`:

```bash
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.24.1/install.sh | bash
```

**NB: on OSX, you will need to have the developer tools installed (e.g. by installing XCode).**

Then, install the latest Node.js, which will automatically install the latest `npm` as well, and set that version as the default:

```bash
source ~/.nvm/nvm.sh
nvm install 0.10
nvm alias default 0.10
nvm use default
```

Now you should have `node` and `npm` available. Check by running:

```
node -v
npm -v
```

If both of those printed version numbers, you're ready to move on to installing `quickscrape`.

#### Quickscrape

`quickscrape` is very easy to install. Simply:

```bash
npm install --global quickscrape
```

### Documentation

Run `quickscrape --help` from the command line to get help:

```
Usage: quickscrape [options]

Options:

-h, --help               output usage information
-V, --version            output the version number
-u, --url <url>          URL to scrape
-r, --urllist <path>     path to file with list of URLs to scrape (one per line)
-s, --scraper <path>     path to scraper definition (in JSON format)
-d, --scraperdir <path>  path to directory containing scraper definitions (in JSON format)
-o, --output <path>      where to output results (directory will be created if it doesn't exist
-r, --ratelimit <int>    maximum number of scrapes per minute (default 3)
-h --headless            render all pages in a headless browser
-l, --loglevel <level>   amount of information to log (silent, verbose, info*, data, warn, error, or debug)
-f, --outformat <name>   JSON format to transform results into (currently only bibjson)
```

You must provide scraper definitions in ScraperJSON format as used in the [ContentMine journal-scrapers](https://github.com/ContentMine/journal-scrapers).

### Examples

#### 1. Extract data from a single URL with a predefined scraper

First, you'll want to grab some pre-cooked definitions:

```bash
git clone https://github.com/ContentMine/journal-scrapers.git
```

Now just run `quickscrape`:

```bash
quickscrape \
  --url https://peerj.com/articles/384 \
  --scraper journal-scrapers/scrapers/peerj.json \
  --output peerj-384
  --outformat bibjson
```

You'll see log messages informing you how the scraping proceeds:

![Single URL log output](docs/screenshot_log_single_url.png)

Then in the `peerj-384` directory there are several files:

```
$ tree peerj-384
peerj-384/
  └── https_peerj.com_articles_384
    ├── bib.json
    ├── fig-1-full.png
    ├── fulltext.html
    ├── fulltext.pdf
    ├── fulltext.xml
    └── results.json
```

- `fulltext.html` is the fulltext HTML (duh!)
- `results.json` is a JSON file containing all the captured data
- `bib.json` is a JSON file containing the results in bibJSON format
- `fig-1-full.png` is the downloaded image from the only figure in the paper

`results.json` looks like this (truncated):

```json
{
  "publisher": {
    "value": [
      "PeerJ Inc."
    ]
  },
  "journal_name": {
    "value": [
      "PeerJ"
    ]
  },
  "journal_issn": {
    "value": [
      "2167-8359"
    ]
  },
  "title": {
    "value": [
      "Mutation analysis of the SLC26A4, FOXI1 and KCNJ10 genes in individuals with congenital hearing loss"
    ]
  },
  "keywords": {
    "value": [
      "Pendred; MLPA; DFNB4; \n          SLC26A4\n        ; FOXI1 and KCNJ10; Genotyping; Genetics; SNHL"
    ]
  },
  "author_name": {
    "value": [
      "Lynn M. Pique",
      "Marie-Luise Brennan",
      "Colin J. Davidson",
      "Frederick Schaefer",
      "John Greinwald Jr",
      "Iris Schrijver"
    ]
  }
}
```

`bib.json` looks like this (truncated):

```json
{
  "title": "Mutation analysis of the SLC26A4, FOXI1 and KCNJ10 genes in individuals with congenital hearing loss",
  "link": [
    {
      "type": "fulltext_html",
      "url": "https://peerj.com/articles/384"
    },
    {
      "type": "fulltext_pdf",
      "url": "https://peerj.com/articles/384.pdf"
    },
    {
      "type": "fulltext_xml",
      "url": "/articles/384.xml"
    }
  ],
  "author": [
    {
      "name": "Lynn M. Pique",
      "institution": "Department of Pathology, Stanford University Medical Center, Stanford, CA, USA"
    },
    {
      "name": "Marie-Luise Brennan",
      "institution": "Department of Pediatrics, Stanford University Medical Center, Stanford, CA, USA"
    }
  ]
}
```

### Contributing

We are not yet accepting contributions, if you'd like to help please drop me an email (richard@contentmine.org) and I'll let you know when we're ready for that.

### Release History

- ***0.1.0*** - initial version with simple one-element scraping
- ***0.1.1*** - multiple-member elements; clean exiting; massive speedup
- ***0.1.2*** - ability to grab text or HTML content of a selected node via special attributes `text` and `html`
- ***0.1.3*** - refactor into modules, full logging suite, much more robust downloading
- ***0.1.4*** - multiple URL processing, bug fixes, reduce dependency list
- ***0.1.5*** - fix bug in bubbling logs up from PhantomJS
- ***0.1.6*** - add dependency checking option
- ***0.1.7*** - fix bug where jsdom rendered external resources (#10)
- ***0.2.0*** - core moved out to separate library: [thresher](https://github.com/ContentMine/thresher). PhantomJS and CasperJS binaries now managed through npm to simplify installation.
- ***0.2.1*** - fix messy metadata
- ***0.2.3*** - automatic scraper selection
- ***0.2.4-5*** - bump thresher dependency for bug fixes
- ***0.2.6-7*** - new Thresher API
- ***0.2.8*** - fix Thresher API use
- ***0.3.0*** - use Thresher 0.1.0 and scraperJSON 0.1.0
- ***0.3.1*** - update the reported version number left out of last release
- ***0.3.2*** - fix dependencies
- ***0.3.3-6*** - bug fixes
- ***0.3.7*** - fix bug in bibJSON dates. Bump to thresher 0.1.3.
- ***0.4.0*** - fix various bugs (with urllists, tokenized urls), print help when run with no args, update all dependencies.
- ***0.4.1*** - fix version number reporting.

### License

Copyright (c) 2014 Shuttleworth Foundation
Licensed under the MIT license.
