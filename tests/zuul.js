/* eslint-env mocha */
var addressbar = require('../index.js')

var assert = require('chai').assert
assert.skip = function () {}

var location = window.location
var history = window.history
var origin = location.protocol + '//' + location.host
var path = '/__zuul'
console.log('initial history.length:', history.length)

function preventDefault (event) {
  event.preventDefault()
}

function restorePrevUrl () {
  // avoids bug in current code base
  addressbar.once('change', function () {
    history.pushState({}, '', path)
  })
  history.pushState({}, '', path)
  history.back()
}

beforeEach(function (done) {
  addressbar.value = path
  setTimeout(done, 10)
})

afterEach(function (done) {
  addressbar.removeAllListeners('change')
  restorePrevUrl()
  setTimeout(done, 10)
})

describe('addressbar', function () {
  it('should have eventEmitter methods', function () {
    assert.isFunction(addressbar.on)
    assert.isFunction(addressbar.once)
    assert.equal(addressbar.on, addressbar.addEventListener)
    assert.equal(addressbar.on, addressbar.addListener)

    assert.isFunction(addressbar.removeEventListener)
    assert.equal(addressbar.removeEventListener, addressbar.removeListener)
  })

  it('should expose URLUtils api', function () {
    addressbar.value = path + '#hash'

    assert.equal(addressbar.origin, origin)
    assert.equal(addressbar.protocol, location.protocol)
    assert.equal(addressbar.port, location.port)
    assert.equal(addressbar.hostname, location.hostname)
    assert.equal(addressbar.pathname, location.pathname)
    assert.equal(addressbar.hash, location.hash)
    console.log(origin, location.protocol, location.port, location.hostname, location.pathname, location.hash)
  })

  describe('value', function () {
    it('should return current location', function () {
      assert.equal(addressbar.value, location.href)
      console.log(location.href)
    })

    it('should update current location', function () {
      addressbar.value = origin + path + '#current'
      assert.equal(location.href, origin + path + '#current')
    })

    it('should prepend origin if only path provided', function () {
      addressbar.value = path + '#prepend'
      assert.equal(addressbar.value, origin + path + '#prepend')

      addressbar.value = { value: path + '#obj-prepend' }
      assert.equal(addressbar.value, origin + path + '#obj-prepend')
    })

    it('should push state on assign', function (done) {
      addressbar.value = path + '#assign'

      addressbar.once('change', function () {
        assert.equal(addressbar.value, origin + path)
        done()
      })
      history.back()
    })

    it('should push state by default if set with object', function (done) {
      addressbar.value = { value: path + '#obj-assign' }

      addressbar.once('change', function () {
        assert.equal(addressbar.value, origin + path)
        done()
      })
      history.back()
    })

    it('should allow replace state if set with object', function (done) {
      addressbar.value = path + '#initial'

      addressbar.value = { value: path + '#obj-replace-false', replace: false }

      addressbar.once('change', function () {
        assert.equal(addressbar.value, origin + path + '#initial')

        addressbar.value = { value: path + '#obj-replace-true', replace: true }

        addressbar.once('change', function () {
          assert.equal(addressbar.value, origin + path)
          done()
        })
        history.back()
      })
      history.back()
    })

    it('should replace state if url have not changed', function (done) {
      addressbar.value = path + '#same'
      addressbar.value = path + '#same'
      addressbar.value = path + '#another'

      addressbar.once('change', function () {
        assert.equal(addressbar.value, origin + path + '#same')

        addressbar.once('change', function () {
          assert.equal(addressbar.value, origin + path)
          done()
        })
        history.back()
      })
      history.back()
    })
  })

  describe('change event', function () {
    it('should emit on history traversal and provide target.value', function (done) {
      addressbar.once('change', function (event) {
        assert.equal(event.target.value, origin + path + '#emit-history1')
        done()
      })

      addressbar.value = path + '#emit-history1'
      addressbar.value = path + '#emit-history2'
      history.back()
    })

    it('should emit on hashchange and provide target.value', function (done) {
      addressbar.once('change', function (event) {
        assert.equal(event.target.value, origin + path + '#emit-hashchange')
        done()
      })

      location.hash = '#emit-hashchange'
    })

    it('should emit on same origin url link click and provide target.value', function (done) {
      var a = document.createElement('a')
      addressbar.once('change', function (event) {
        assert.equal(event.target.value, origin + path + '#same-origin-absolute')
      })

      a.href = origin + path + '#same-origin-absolute'
      document.body.appendChild(a)
      a.click()

      addressbar.once('change', function (event) {
        assert.equal(event.target.value, origin + path + '#same-origin-relative')
      })

      a.href = path + '#same-origin-relative'
      a.click()

      addressbar.once('change', function (event) {
        assert.equal(event.target.value, origin + path + '#same-origin-resolve')
        done()
      })

      a.href = origin + path + '../#same-origin-resolve'
      a.click()
      a.remove()
    })

    it('should not emit on cross origin url link click', function (done) {
      addressbar.once('change', done)

      var a = document.createElement('a')
      a.href = 'http://example.com/path'
      document.body.appendChild(a)
      a.addEventListener(document.ontouchstart ? 'touchstart' : 'click', preventDefault)
      a.click()
      a.remove()

      setTimeout(done, 100)
    })

    it.skip('planned feat: should not emit on same url click')

    it('should allow preventDefault clicks', function () {
      addressbar.once('change', preventDefault)

      var length = history.length
      var a = document.createElement('a')
      a.href = origin + path + '#prevent-click'
      document.body.appendChild(a)
      a.click()
      a.remove()

      assert.equal(addressbar.value, origin + path)
      assert.equal(history.length, length)
    })

    it('should allow preventDefault hashchange', function (done) {
      addressbar.on('change', preventDefault)

      location.hash = '#prevent-hashchange'
      assert.equal(addressbar.value, origin + path)

      location.hash = '#prevent-hashchange2'
      assert.equal(addressbar.value, origin + path)
      setTimeout(done, 100)
    })

    it('should allow set manually if default prevented', function (done) {
      var length = history.length

      addressbar.on('change', preventDefault)
      addressbar.on('change', function (event) {
        addressbar.value = event.target.value
        assert.equal(addressbar.value, origin + path + '#set-manually-after-prevented')
        assert.skip(history.length, length + 1)
        done()
      })

      location.hash = '#set-manually-after-prevented'
    })

    it('should allow set manually if default prevented', function (done) {
      var length = history.length

      addressbar.on('change', preventDefault)
      addressbar.on('change', function (event) {
        addressbar.value = event.target.value
        assert.equal(addressbar.value, origin + path + '#set-manually-after-prevented2')
        assert.skip(history.length, length + 1)
        done()
      })

      var a = document.createElement('a')
      a.href = origin + path + '#set-manually-after-prevented2'
      document.body.appendChild(a)
      a.click()
      a.remove()
    })
  })

  describe('extra cases', function () {
    it('should handle back and forward witn popstate', function (done) {
      addressbar.on('change', preventDefault)
      addressbar.on('change', function (event) {
        addressbar.value = event.target.value
      })

      var a = document.createElement('a')
      document.body.appendChild(a)
      a.href = origin + path + '#/messages'
      a.click()
      a.href = origin + path + '#/messages/123'
      a.click()
      a.remove()

      assert.equal(addressbar.value, origin + path + '#/messages/123')

      addressbar.once('change', function (event) {
        assert.equal(addressbar.value, origin + path + '#/messages')

        addressbar.once('change', function (event) {
          assert.equal(addressbar.value, origin + path + '#/messages/123')
          done()
        })
        history.forward()
      })
      history.back()
    })

    it('should handle trailing slash convertion')
  })
})
