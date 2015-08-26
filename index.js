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

  var onUrlChange = function (type) {
    return function (event) {

      if (linkClicked) {
        linkClicked = type !== 'hash';
        return;
      }

      if (isSilent) {
        isSilent = type !== 'hash';
        return;
      }

      if (type === 'hash' && (event.newURL === location.href || isSilent)) {
        console.log('returning!');
        return;
      }

      if ('state' in event || (event.state && event.state.index < index)) {
        doReplace = true;
      }

      console.log('emitting!', type);
      emitChange();

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

      hasSetUrl = false;

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

      hasSetUrl = true;

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

  global.addEventListener('click', function (event) {
    if (event.target.tagName === 'A') {
      linkClicked = true;
      emitChange(event.target.href, event);
    }
  });

  instance = eventEmitter;

  return eventEmitter;

}());
