# Skosmos API client [![NPM Version](https://img.shields.io/npm/v/skosmos-api-client.svg)](https://npmjs.org/package/skosmos-api-client) [![Build Status](https://travis-ci.org/NatLibFi/skosmos-api-client.svg)](https://travis-ci.org/NatLibFi/skosmos-api-client) [![Test Coverage](https://codeclimate.com/github/NatLibFi/skosmos-api-client/badges/coverage.svg)](https://codeclimate.com/github/NatLibFi/skosmos-api-client/coverage)

Javascript client for accessing services using [Skosmos](https://skosmos.org), like [Finto](https://finto.fi). The client provides a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)-based API for accessing the [HTTP REST API of Skosmos](https://github.com/NatLibFi/Skosmos/wiki/REST-API).

## Usage

**AS OF NOW, ONLY A FEW SKOSMOS METHODS ARE IMPLEMENTED BY THIS MODULE**

The module returns a factory function that takes a single argument which is an object. The object has a mandatory property **url** which denotes the URL of the Skosmos endpoint. The factory function returns an object with the following methods:

- **vocabularies** (*lang*): Returns an array of vocabulary objects ([`/vocabularies`](https://github.com/NatLibFi/Skosmos/wiki/REST-API#vocabularies))
- **vocabulary** (*name*, *lang*): Returns an object which contains information about the vocabulary *name* ([`/<vocid>/`](https://github.com/NatLibFi/Skosmos/wiki/REST-API#vocid))
  - **lookup** (*name*, *label*, *lang*): Searches *label* from vocabulary *name*. Returns an array of label objects ([`/<vocid>/lookup`](https://github.com/NatLibFi/Skosmos/wiki/REST-API#vocidlookup))

### Node.js

```js
var skosmos_client = require('skosmos-api-client/lib/nodejs')({
  url: 'https://api.finto.fi/rest/v1'
});

return skosmos_client.vocabulary.lookup('yso', 'cat', 'en').then(function(result) {
  // Do something with the result
});
```

### AMD
```js
define(['skosmos-api-client/lib/browser'], function(skosmosClientFactory) {

  var skosmos_client = skosmosClientFactory({
    url: 'https://api.finto.fi/rest/v1'
  });

  return skosmos_client.vocabulary.lookup('yso', 'cat', 'en').then(function(result) {
    // Do something with the result
  });

});

```

## Development 

Clone the sources and install the package using `npm`:

```sh
npm install
```

Run the following NPM script to lint, test and check coverage of the code:

```javascript

npm run check

```

## License and copyright

Copyright (c) 2016-2017 **University Of Helsinki (The National Library Of Finland)**

This project's source code is licensed under the terms of **MIT License**.
