var URL = require('url-parse');
var EventEmitter = require('events').EventEmitter;
var instance = null;

var location = window.location;

module.exports = (function () {

  if (instance) {
    return instance;
  }

  var eventEmitter = new EventEmitter();

  eventEmitter.addEventListener = eventEmitter.addListener;
  eventEmitter.removeEventListener = eventEmitter.removeListener;

  var initialUrl = location.href;
  var uri = URL(initialUrl);
  var origin = uri.protocol + '://' + uri.host;
  var isPreventingDefault = false;
  var doReplace = false;
  var prevUrl = '';
  var linkClicked = false;
  var isEmitting = false;
  var setSyncUrl = false;

  var emitChange = function (url, event) {
    eventEmitter.emit('change', {
      preventDefault: function () {
        event && event.preventDefault();
        isPreventingDefault = true;
      },
      target: {
        value: url ? origin + url : location.href
      }
    });
  };

  var onUrlChange = function (type) {
    return function (event) {

      if (location.href === prevUrl) {
        return;
      }

      // Fixes bug where trailing slash is converted to normal url
      if (location.href[location.href.length - 1] === '/') {
        doReplace = true;
      }

      isEmitting = true;
      emitChange();
      isEmitting = false;

      if (!setSyncUrl && isPreventingDefault) {
        history.replaceState({}, '', (prevUrl || initialUrl).replace(origin, ''));
      }

      prevUrl = location.href;
      isPreventingDefault = false;
      setSyncUrl = false;
      doReplace = false;

    };
  };

  global.addEventListener('popstate', onUrlChange('pop'));

  Object.defineProperty(eventEmitter, 'value', {
    get: function () {
      return location.href;
    },
    set: function (value) {

      if (typeof value !== 'string') {
          doReplace = Boolean(value.replace);
          value = value.value;
      }

      // If emitting a change we flag that we are setting
      // a url based on the event being emitted
      if (isEmitting) {
        setSyncUrl = true;
      }

      // Ensure full url
      if (value.indexOf(origin) === -1) {
        value = origin + value;
      }

      // If it is same url, forget about it
      if (value === location.href) {
        return;
      }

      // We might need to replace the url if we are fixing
      // for example trailing slash issue
      if (doReplace) {
        history.replaceState({}, '', value.replace(origin, ''));
        doReplace = false;
      } else {
        history.pushState({}, '', value.replace(origin, ''));
      }

      prevUrl = location.href;
      isPreventingDefault = false;

    }
  });

  // expose URLUtils like API https://developer.mozilla.org/en-US/docs/Web/API/URLUtils
  // thanks https://github.com/cofounders/urlutils for reference
  Object.defineProperty(eventEmitter, 'origin', {
    get: function () {
      var uri = URL(location.href);
      return uri.protocol + '://' + uri.host;
    }
  });

  Object.defineProperty(eventEmitter, 'protocol', {
    get: function () {
      return URL(location.href).protocol + ':';
    }
  });

  Object.defineProperty(eventEmitter, 'port', {
    get: function () {
      return URL(location.href).port;
    }
  });

  Object.defineProperty(eventEmitter, 'hostname', {
    get: function () {
      return URL(location.href).hostname;
    }
  });

  Object.defineProperty(eventEmitter, 'pathname', {
    get: function () {
      return URL(location.href).pathname;
    }
  });

  Object.defineProperty(eventEmitter, 'hash', {
    get: function () {
      return URL(location.href).hash;
    }
  });

  /*
    This code is from the Page JS source code. Amazing work on handling all
    kinds of scenarios with hyperlinks, thanks!
   */

  var isSameOrigin = function (href) {
    return (href && (0 === href.indexOf(origin)));
  }

  var getClickedHref = function (event) {
    // check which button
    if (1 !== (null === event.which ? event.button : event.which)) { return false };

    // check for modifiers
    if (event.metaKey || event.ctrlKey || event.shiftKey) { return false };
    if (event.defaultPrevented) { return false };

    // ensure link
    var element = event.target;
    while (element && 'A' !== element.nodeName) { element = element.parentNode };
    if (!element || 'A' !== element.nodeName) { return false };

    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (element.hasAttribute('download') || element.getAttribute('rel') === 'external') { return false };

    // Check for mailto: in the href
    var href = element.getAttribute('href');
    if (href && href.indexOf('mailto:') > -1) { return false };

    // check target
    if (element.target) { return false };

    // x-origin
    if (!isSameOrigin(element.href)) { return false };

    return href;
  }

  global.addEventListener(document.ontouchstart ? 'touchstart' : 'click', function (event) {
    var href = getClickedHref(event);
    if (href) {
      linkClicked = true;
      isEmitting = true;
      emitChange(href, event);
      isEmitting = false;
      if (isPreventingDefault) {
        linkClicked = false;
      }
      prevUrl = href;
      isPreventingDefault = false;
    }
  });

  instance = eventEmitter;

  return eventEmitter;

}());
