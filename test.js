var webdriver = require('selenium-webdriver');
var by = webdriver.By;
var baseUrl = 'http://localhost:3001/';
var preventUrl = baseUrl + 'tests/preventdefault/';
var setUrl = baseUrl + 'tests/set/';
var popstateUrl = baseUrl + 'tests/popstate/';
var hashUrl = baseUrl + 'tests/hash/';
var trailingUrl = baseUrl + 'tests/trailing/';

exports['should display current url'] = function (test) {

  var driver = new webdriver.Builder().
     withCapabilities(webdriver.Capabilities.chrome()).
     build();
  driver.get(preventUrl);
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, preventUrl);
  });
  driver.quit().then(test.done);

};

exports['should not allow going to a new url'] = function (test) {

  var driver = new webdriver.Builder().
     withCapabilities(webdriver.Capabilities.chrome()).
     build();
  driver.get(preventUrl);
  driver.navigate().to(preventUrl + '#/foo');
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, preventUrl);
  });
  driver.quit().then(test.done);

};

exports['should set url manually when prevented'] = function (test) {

  var driver = new webdriver.Builder().
     withCapabilities(webdriver.Capabilities.chrome()).
     build();
  driver.get(setUrl);
  driver.navigate().to(setUrl + '#/foo');
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, setUrl + '#/foo');
  });
  driver.quit().then(test.done);

};

exports['should go to popstate url'] = function (test) {

  var driver = new webdriver.Builder().
     withCapabilities(webdriver.Capabilities.chrome()).
     build();
  driver.get(popstateUrl);

  driver.findElement(by.id('messages')).click();
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'messages');
  });

  driver.findElement(by.id('message')).click();
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'messages/123');
  });

  driver.quit().then(test.done);

};

exports['should handle back and forward with popstate'] = function (test) {

  var driver = new webdriver.Builder().
     withCapabilities(webdriver.Capabilities.chrome()).
     build();
  driver.get(popstateUrl);

  driver.findElement(by.id('messages')).click();
  driver.findElement(by.id('message')).click();
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'messages/123');
  });

  driver.navigate().back();
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'messages');
  });

  driver.navigate().forward();
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'messages/123');
  });

  driver.quit().then(test.done);

};

exports['should go to hash url'] = function (test) {

  var driver = new webdriver.Builder().
     withCapabilities(webdriver.Capabilities.chrome()).
     build();
  driver.get(hashUrl);

  driver.findElement(by.id('messages')).click();
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages');
  });

  driver.findElement(by.id('message')).click();
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages/123');
  });

  driver.quit().then(test.done);

};

exports['should handle back and forward with hash'] = function (test) {

  var driver = new webdriver.Builder().
     withCapabilities(webdriver.Capabilities.chrome()).
     build();
  driver.get(hashUrl);

  driver.findElement(by.id('messages')).click();
  driver.findElement(by.id('message')).click();
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages/123');
  });

  driver.navigate().back();
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages');
  });

  driver.navigate().forward();
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages/123');
  });

  driver.quit().then(test.done);

};

exports['should handle trailing slash convertion'] = function (test) {

  var driver = new webdriver.Builder().
     withCapabilities(webdriver.Capabilities.chrome()).
     build();
  driver.get(trailingUrl + '#/messages/123');
  driver.navigate().to(trailingUrl + '#/messages/');
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, trailingUrl + '#/messages');
  });

  driver.navigate().back();
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, trailingUrl + '#/messages/123');
  });

  driver.navigate().forward();
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, trailingUrl + '#/messages');
  });

  driver.quit().then(test.done);

};

exports['should resume history when changing url when on "back" url'] = function (test) {

    var driver = new webdriver.Builder().
       withCapabilities(webdriver.Capabilities.chrome()).
       build();
    driver.get(hashUrl);

    driver.findElement(by.id('messages')).click();
    driver.findElement(by.id('message')).click();
    driver.getCurrentUrl().then(function (url) {
      test.equal(url, baseUrl + '#/messages/123');
    });

    driver.navigate().back();
    driver.getCurrentUrl().then(function (url) {
      test.equal(url, baseUrl + '#/messages');
    });

    driver.navigate().to(baseUrl + '#/messages/456');
    driver.navigate().forward();
    driver.getCurrentUrl().then(function (url) {
      test.equal(url, baseUrl + '#/messages/456');
    });

    driver.quit().then(test.done);

};
