# addressbar
Makes the addressbar of the browser work just like a normal input

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Commitizen friendly][commitizen-image]][commitizen-url]
[![Semantic Release][semantic-release-image]][semantic-release-url]
[![js-standard-style][standard-image]][standard-url]

## What is this thing?
How would you handle URLs if the addressbar was just an input? An input you could listen to changes, `preventDefault()` on and manually set the value without any sideeffect? What if you could think about changing the url as an event in your app, which you reacted to, instead of letting a route library swallow your view layer and mess around with it in a strongly opinionated way? What if you could have the freedom to make the URL mean whatever you wanted? Not just changes in what views to display?

The library just exposes the `addressbar`. It is a single entity in your app where you can:

```js
// At http://www.example.com

addressbar.value // "http://www.example.com"

// Change addressbar value does NOT trigger route change
addressbar.value = "http://wwww.example.com/test";

// You can force a replace of the url setting an object as value
addressbar.value = {
  value: "http://www.example.com/test",
  replace: true
};

// You have access to location properties
addressbar.origin // "http://www.example.com"
addressbar.port // ""
addressbar.protocol // "http:"
addressbar.hostname // "www.example.com"
addressbar.pathname // "/"
addressbar.hash // ""

// Prevent route changes on hyperlinks
addressbar.addEventListener('change', function (event) {
  event.preventDefault();
  event.target.value // The value of the addressbar
});
```

This is low level code, so there is no routing logic here. Please check out [url-mapper](https://github.com/christianalfoni/url-mapper) which can be used to create routing logic.

## Under the hood
Addressbar listens to `popstate` events and handles hyperlinks. It basically has logic to simulate how an input works, also handling a few edge cases.

## Tests
Addressbar is running with selenium-driver and nodeunit to test live in Chrome. Requires [selenium chrome driver](https://sites.google.com/a/chromium.org/chromedriver/downloads) to be installed and added to **PATH**.

Run tests:
- `npm install`
- `npm start` (fires up a python webservice)
- `npm test` (Runs tests)

[npm-image]: https://img.shields.io/npm/v/addressbar.svg?style=flat
[npm-url]: https://npmjs.org/package/addressbar
[travis-image]: https://img.shields.io/travis/cerebral/addressbar.svg?style=flat
[travis-url]: https://travis-ci.org/cerebral/addressbar
[commitizen-image]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/
