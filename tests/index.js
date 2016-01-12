var webdriver = require('selenium-webdriver')
var by = webdriver.By
var baseUrl = 'http://localhost:3001/'
var preventUrl = baseUrl + 'tests/preventdefault/'
var setUrl = baseUrl + 'tests/set/'
var popstateUrl = baseUrl + 'tests/popstate/'
var hashUrl = baseUrl + 'tests/hash/'
var trailingUrl = baseUrl + 'tests/trailing/'
var uichange = baseUrl + 'tests/uichange/'
var replace = baseUrl + 'tests/replace/'
var uri = baseUrl + 'tests/uri/'

exports['should display current url'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(preventUrl)
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, preventUrl)
  })
  driver.quit().then(test.done)
}

exports['should not allow going to a new url'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(preventUrl)
  driver.navigate().to(preventUrl + '#/foo')
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, preventUrl)
  })
  driver.quit().then(test.done)
}

exports['should set url manually when prevented'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(setUrl)
  driver.navigate().to(setUrl + '#/foo')
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, setUrl + '#/foo')
  })
  driver.quit().then(test.done)
}

exports['should go to popstate url'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(popstateUrl)

  driver.findElement(by.id('messages')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'messages')
  })

  driver.findElement(by.id('message')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'messages/123')
  })

  driver.quit().then(test.done)
}

exports['should handle back and forward with popstate'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(popstateUrl)

  driver.findElement(by.id('messages')).click()
  driver.findElement(by.id('message')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'messages/123')
  })

  driver.navigate().back()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'messages')
  })

  driver.navigate().forward()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'messages/123')
  })

  driver.quit().then(test.done)
}

exports['should go to hash url'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(hashUrl)

  driver.findElement(by.id('messages')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages')
  })

  driver.findElement(by.id('message')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages/123')
  })

  driver.quit().then(test.done)
}

exports['should handle back and forward with hash'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(hashUrl)

  driver.findElement(by.id('messages')).click()
  driver.findElement(by.id('message')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages/123')
  })

  driver.navigate().back()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages')
  })

  driver.navigate().forward()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages/123')
  })

  driver.quit().then(test.done)
}

exports['should handle trailing slash convertion'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(trailingUrl + '#/messages/123')
  driver.navigate().to(trailingUrl + '#/messages/')
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, trailingUrl + '#/messages')
  })

  driver.navigate().back()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, trailingUrl + '#/messages/123')
  })

  driver.navigate().forward()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, trailingUrl + '#/messages')
  })

  driver.quit().then(test.done)
}

exports['should resume history when changing url when on "back" url'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(hashUrl)

  driver.findElement(by.id('messages')).click()
  driver.findElement(by.id('message')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages/123')
  })

  driver.navigate().back()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages')
  })

  driver.navigate().to(baseUrl + '#/messages/456')
  driver.navigate().forward()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages/456')
  })

  driver.quit().then(test.done)
}

exports['should be able to go forward and backwards twice'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(uichange)

  driver.findElement(by.id('messages')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, baseUrl + '#/messages')
  })

  driver.navigate().back()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'tests/uichange/')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, baseUrl + 'tests/uichange/')
  })

  driver.findElement(by.id('messages')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, baseUrl + '#/messages')
  })

  driver.navigate().back()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'tests/uichange/')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, baseUrl + 'tests/uichange/')
  })

  driver.quit().then(test.done)
}

exports['should be able to move back and forward with mix of url and setting manually and still use back button'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(uichange)

  driver.findElement(by.id('home')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, baseUrl + '#/')
  })

  driver.findElement(by.id('messages')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, baseUrl + '#/messages')
  })

  driver.findElement(by.id('home')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, baseUrl + '#/')
  })

  driver.findElement(by.id('messages')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, baseUrl + '#/messages')
  })

  driver.navigate().back()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, baseUrl + '#/')
  })

  driver.navigate().back()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, baseUrl + '#/messages')
  })

  driver.navigate().back()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, baseUrl + '#/')
  })

  driver.navigate().back()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + 'tests/uichange/')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, baseUrl + 'tests/uichange/')
  })

  driver.quit().then(test.done)
}

exports['should be able to replace the set url'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(replace)

  driver.findElement(by.id('home')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/home')
  })

  driver.findElement(by.id('messagesReplace')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages')
  })

  driver.navigate().back()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, 'http://localhost:3001/tests/replace/')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, 'http://localhost:3001/tests/replace/')
  })

  driver.findElement(by.id('home')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/home')
  })

  driver.findElement(by.id('messages')).click()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, baseUrl + '#/messages')
  })

  driver.navigate().back()
  driver.getCurrentUrl().then(function (url) {
    test.equal(url, 'http://localhost:3001/#/home')
  })
  driver.findElement(by.id('url')).getText().then(function (text) {
    test.equal(text, 'http://localhost:3001/#/home')
  })

  driver.quit().then(test.done)
}

exports['should expose origin, protocol, port and hostname as properties'] = function (test) {
  var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.phantomjs()).build()
  driver.get(uri)

  driver.getCurrentUrl().then(function (url) {
    test.equal(url, 'http://localhost:3001/tests/uri/')
  })
  driver.findElement(by.id('origin')).getText().then(function (text) {
    test.equal(text, 'http://localhost:3001')
  })
  driver.findElement(by.id('protocol')).getText().then(function (text) {
    test.equal(text, 'http:')
  })
  driver.findElement(by.id('port')).getText().then(function (text) {
    test.equal(text, '3001')
  })
  driver.findElement(by.id('hostname')).getText().then(function (text) {
    test.equal(text, 'localhost')
  })
  driver.findElement(by.id('pathname')).getText().then(function (text) {
    test.equal(text, '/tests/uri/')
  })
  driver.findElement(by.id('hash')).getText().then(function (text) {
    test.equal(text, '')
  })

  driver.findElement(by.id('messages')).click()
  driver.findElement(by.id('pathname')).getText().then(function (text) {
    test.equal(text, '/')
  })
  driver.findElement(by.id('hash')).getText().then(function (text) {
    test.equal(text, '#/messages')
  })

  driver.quit().then(test.done)
}
