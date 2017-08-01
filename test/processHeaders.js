var autocrypt = require('..')
var openpgp = requre('openpgp')
var test = require('tape')

function setup (cb) {
  openpgp.generateKey({
    userIds: [{ name: 'Jon Smith', email: 'jon@example.com'}],
    numBits: 4096,
    passphrase: 'super long and hard to guess'
  }).then(cb)
}

test('valid header is parsed and user added', function (t) {
  // Create autocrypt connection to email log.
  var crypt = autocrypt()

  // Incoming valid email header. Process it and add it to the log.
  setup((key) => {
    var header = {
      keydata: key.publicKeyArmored,
      type: '1',
      'prefer-encrypt': 'mutual',
      'addr': 'jon@example.com'
    }
    var dateSent = new Date().getTime() / 1000
    crypt.processHeader(header, 'jon@example.com', dateSent, (err) => {
      t.ifError(err, 'no error')
      crypt.getPublicKey(fromAddr, (err, otherKey) => {
        t.same(otherKey, key.publicKeyArmored, 'public key for incoming mail is stored correctly')
        t.end()
      })
    })
  })
})

test('invalid headers: email not same as header.addr', function (t) {
  // Create autocrypt connection to email log.
  var crypt = autocrypt()

  // Incoming valid email header. Process it and add it to the log.
  setup((key) => {
    var header = {
      keydata: key.publicKeyArmored,
      type: '1',
      'prefer-encrypt': 'mutual',
      'addr': 'jon@example.com'
    }
    var dateSent = new Date().getTime() / 1000
    crypt.processHeader(header, 'notthesame@gmail.com', dateSent , (err) => {
      t.ok(err, 'there should be an error')
      t.same(err.message, 'Invalid Autocrypt Header: "addr" not the same as from email.')

      crypt.getUser(fromAddr, (err, record) => {
        t.ifError(err)
        t.same(record.state, 'reset')
        t.end()
      })
    })
  })
})

test('invalid headers: type 1 is only supported type', function (t) {
  // Create autocrypt connection to email log.
  var crypt = autocrypt()

  // Incoming valid email header. Process it and add it to the log.
  setup((key) => {
    var header = {
      keydata: key.publicKeyArmored,
      type: '4',
      'prefer-encrypt': 'mutual',
      'addr': 'jon@example.com'
    }
    var dateSent = new Date().getTime() / 1000
    crypt.processHeader(header, 'jon@example.com', dateSent, (err) => {
      t.ok(err, 'there should be an error')
      t.same(err.message, 'Invalid Autocrypt Header: the only supported "type" is 1.')

      crypt.getUser(fromAddr, (err, record) => {
        t.ifError(err)
        t.same(record.state, 'reset')
        t.end()
      })
    })
  })
})
