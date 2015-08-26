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

      if (isSilent) {
        isSilent = false;
        return;
      }

      if (type === 'hash' && (event.newURL === location.href || isSilent)) {
        return;
      }

      if ('state' in event || (event.state && event.state.index < index)) {
        doReplace = true;
      }

      emitChange();

      if (isPreventingDefault) {
        isSilent = true;
        isPreventingDefault = false;
        history.replaceState({url: prevUrl, index: index}, '', prevUrl.replace(origin, ''));
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
      event.preventDefault();
      emitChange(event.target.href);
    }
  });

  instance = eventEmitter;

  return eventEmitter;

}());
