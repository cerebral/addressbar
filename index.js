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
  var index = 0;
  var doReplace = false;
  var isBatching = false;
  var batch = [];

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

      if (type === 'hash' && event.newURL === location.href) {
        return;
      }

      if ('state' in event || (event.state && event.state.index < index)) {
        doReplace = true;
      }

      emitChange();

    };
  };

  global.addEventListener('hashchange', onUrlChange('hash'));
  global.addEventListener('popstate', onUrlChange('pop'));

  Object.defineProperty(eventEmitter, 'value', {
    get: function () {
      return location.href;
    },
    set: function (value) {

      batch.push(value);

      if (!isBatching) {
        isBatching = true;
        setTimeout(function () {
          value = batch.pop();
          if (!doReplace) {
            history.pushState({url: value, index: index++}, '', value.replace(origin, ''));
          } else {
            history.replaceState({url: value, index: index}, '', value.replace(origin, ''));
            doReplace = false;
          }
          batch = [];
          isBatching = false;
        }, 0);
      }
    }
  });

  global.addEventListener('click', function (event) {


    if (event.target.tagName === 'A') {
      event.preventDefault();
      emitChange(event.target.href);
    }
  });

  instance = eventEmitter;

  return eventEmitter;

}());
