var EventEmitter = require('events').EventEmitter;
var instance = null;
module.exports = (function () {

  if (instance) {
    return instance;
  }

  var eventEmitter = new EventEmitter();

  eventEmitter.addEventListener = eventEmitter.addListener;
  eventEmitter.removeEventListener = eventEmitter.removeListener;

  var origin = location.origin;
  var isPreventingDefault = false;
  var isSilent = false;
  var index = 0;
  var doReplace = false;
  var prevUrl = location.href;
  var hasSetUrl = false;
  var linkClicked = false;
  var isEmitting = false;

  var emitChange = function (url, event) {
    eventEmitter.emit('change', {
      preventDefault: function () {
        event && event.preventDefault();
        isPreventingDefault = true;
      },
      target: {
        value: url || location.href
      }
    });
  };

  var hasHash = function (url) {
    return location.href.indexOf('#') !== -1;
  };

  var onUrlChange = function (type) {
    return function (event) {

      if (linkClicked && hasHash() && type === 'pop') {
        linkClicked = false;
        return;
      }

      if (isSilent && hasHash() && type === 'pop') {
        isSilent = false;
        return;
      }

      if (hasHash && type === 'pop') {
        return;
      }

      if ('state' in event || (event.state && event.state.index < index)) {
        doReplace = true;
      }

      isEmitting = true;
      emitChange();
      isEmitting = false;

      if (isPreventingDefault) {
        isPreventingDefault = false;
        if (location.href.indexOf('#') === -1) {
          isSilent = false;
        } else {
          isSilent = true;

          // If not set any new url, meaning its just prevented,
          // revert url
          if (!hasSetUrl) {
            history.replaceState({url: prevUrl, index: index}, '', prevUrl.replace(origin, ''));
          }

        }

      } else {
        isSilent = false;
        prevUrl = location.href;
      }

    };
  };

  global.addEventListener('hashchange', onUrlChange('hash'));
  global.addEventListener('popstate', onUrlChange('pop'));

  Object.defineProperty(eventEmitter, 'value', {
    get: function () {
      return location.href;
    },
    set: function (value) {

      if (value.indexOf(origin) === -1) {
        value = origin + value;
      }

      // This might be part of a sync event, which
      // should be reverted when sync execution is done
      if (isEmitting) {
        hasSetUrl = true;
      }

      if (value === location.href) {
        return;
      }

      if (!doReplace) {
        history.pushState({url: value, index: index++}, '', value.replace(origin, ''));
      } else {
        history.replaceState({url: value, index: index}, '', value.replace(origin, ''));
        doReplace = false;
      }

      isPreventingDefault = false;

    }
  });

  var isSameOrigin = function (href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
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
      emitChange(href, event);
      if (isPreventingDefault) {
        linkClicked = false;
      }
    }
  });

  instance = eventEmitter;

  return eventEmitter;

}());
