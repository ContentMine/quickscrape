var moment = require('moment')
  , fs = require('fs');
var outformat = module.exports;

outformat.format = function(fmt, res) {
  if (fmt.toLowerCase() === 'bibjson') {
    var outfile = 'bib.json';
    var bib = outformat.bibJSON(res);
    var pretty = JSON.stringify(bib, undefined, 2);
    return fs.writeFileSync(outfile, pretty);
  } else {
    return false;
  }
}

outformat.bibJSON = function(t) {
  var x = {};

  // single value metadata
  ['title'].forEach(function(key) {
    if (t[key] && t[key].value && t[key].value.length > 0) {
      x[key] = t[key].value[0];
    }
  });

  // links
  x.link = [];
  ['fulltext_html',
   'fulltext_pdf',
   'fulltext_xml',
   'supplementary_file'].forEach(function(type) {
    if (t[type] && t[type].value && t[type].value.length > 0) {
      t[type].value.forEach(function(url) {
        x.link.push({ type: type, url: url });
      });
    }
  });

  // people
  ['author', 'editor', 'reviewer'].forEach(function(key) {
    var people = [];
    ['name', 'givenName',
     'familyName', 'institution'].forEach(function(type) {
      var endkey = key + '_' + type;
      if (t[endkey] && t[endkey].value) {
        var i = 0;
        t[endkey].value.forEach(function(y) {
          if (people.length < i + 1) {
            people.push({});
          }
          people[i][type] = y;
          i += 1;
        });
      }
    });
    if (people.length > 0) {
      x[key] = people;
    }
  });

  // publisher
  if (t.publisher && t.publisher.value && t.publisher.value.length > 0) {
    x.publisher = { name: t.publisher.value[0] };
  }

  // journal
  x.journal = {};
  ['volume', 'issue', 'firstpage',
   'lastpage', 'pages'].forEach(function(key) {
    if (t[key] && t[key].value && t[key].value.length > 0) {
      x.journal[key] = t[key].value[0];
    }
  });
  if (t.journal_name &&
      t.journal_name.value &&
      t.journal_name.value.length > 0) {
    x.journal.name = t.journal_name.value[0];
  }
  if (t.journal_issn &&
      t.journal_issn.value &&
      t.journal_issn.value.length > 0) {
    x.journal.issn = t.journal_issn.value[0];
  }

  // sections
  x.sections = {};
  // single-entry fields
  ['abstract', 'description', 'introduction', 'methods', 'results',
   'discussion', 'conclusion', 'case_report', 'acknowledgement',
   'author_contrib', 'competing_interest'].forEach(function(key) {
    var record = {};
    var htmlkey = key + '_html';
    var textkey = key + '_text';
    [key, textkey].forEach(function(endkey) {
      if (t[endkey] && t[endkey].value && t[endkey].value.length > 0) {
        record.text = t[endkey].value[0]
      }
    });
    if (t[htmlkey] && t[htmlkey].value && t[htmlkey].value.length > 0) {
      record.html = t[htmlkey].value[0]
    }
    if (Object.keys(record).length > 0) {
      x.sections[key] = record;
    }
  });
  // multiple-entry fields
  ['references_html', 'tables_html', 'figures_html'].forEach(function(key) {
    if (t[key] && t[key].value && t[key].value.length > 0) {
      var outkey = key.replace(/_html$/, '')
      x.sections[outkey] = t[key].value.map(function(y) {
        return {
          html: y
        };
      });
    }
  });

  // date
  x.date = {};
  ['date_published', 'date_submitted',
   'date_accepted'].forEach(function(key) {
    if (t[key] && t[key].value && t[key].value.length > 0) {
      var date = t[key].value[0];
      if (date.constructor === Array) {
        date = date[0];
      }
      key = key.replace(/^date_/, '');
      x.date[key] = moment(new Date(date.trim())).format();
    }
  });

  // identifier
  x.identifier = [];
  ['doi', 'pmid'].forEach(function(key) {
    if (t[key] && t[key].value && t[key].value.length > 0) {
      x.identifier.push({
        type: key,
        id: t[key].value[0]
      });
    }
  });

  // license
  if (t.license && t.license.value && t.license.value.length > 0) {
    x.license = t.license.value.map(function(y) {
      return { raw: y };
    });
  }

  // copyright
  if (t.copyright && t.copyright.value) {
    x.copyright = t.copyright.value;
  }

  x['log'] = [
    {
      date: moment().format(),
      'event': 'scraped by quickscrape v' + QSVERSION
    }
  ]

  return x;
}
