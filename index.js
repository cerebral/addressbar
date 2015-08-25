var EventEmitter = require('events').EventEmitter;
var instance = null;
module.exports = (function () {

  if (instance) {
    return instance;
  }

  var eventEmitter = new EventEmitter();

  eventEmitter.addEventListener = eventEmitter.addListener;
  eventEmitter.removeEventListener = eventEmitter.removeListener;

  var prevUrl = null;
  var origin = location.origin;
  var isPreventingDefault = false;

  var emitChange = function (url) {
    eventEmitter.emit('change', {
      preventDefault: function () {
        isPreventingDefault = true;
      },
      target: {
        value: url || location.href
      }
    });
  };

  var onUrlChange = function (type) {
    return function (event) {

      event.preventDefault();

      if (isPreventingDefault || location.href === prevUrl) {
        isPreventingDefault = false;
        return;
      }

      emitChange();

      if (isPreventingDefault) {
        history.replaceState({}, '', prevUrl.replace(origin, ''));
      } else {
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
      isPreventingDefault = true;
      history.pushState({}, '', value.replace(origin, ''));
    }
  });

  global.addEventListener('click', function (event) {

    if (event.target.tagName === 'A' && eventEmitter.listeners('change').length) {
      event.preventDefault();
      emitChange(event.target.href);
    }
  });

  instance = eventEmitter;

  return eventEmitter;

}());
