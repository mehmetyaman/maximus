var Iyzipay = require('iyzipay')
var config = require('config')
var paypal = require('paypal-rest-sdk')

module.exports = function (app) {
  var conversationId
  var token

  app.post('/payment/paypal/pay', function (req, res) {
    var createPaymentJson = {
      'intent': 'sale',
      'payer': {
        'payment_method': 'paypal'
      },
      'redirect_urls': {
        'return_url': 'http://return.url',
        'cancel_url': 'http://cancel.url'
      },
      'transactions': [
        {
          'item_list': {
            'items': [
              {
                'name': 'item',
                'sku': 'item',
                'price': '1.00',
                'currency': 'USD',
                'quantity': 1
              }]
          },
          'amount': {
            'currency': 'USD',
            'total': '1.00'
          },
          'description': 'This is the payment description.'
        }]
    }

    paypal.payment.create(createPaymentJson, function (error, payment) {
      if (error) {
        throw error
      } else {
        console.log('Create Payment Response')
        console.log(payment)
      }
    })
  })

  app.post('/payment-result', function (req, res, next) {
    var iyzipay = new Iyzipay(
      config.get('iyzico_client.api')
    )

    iyzipay.checkoutForm.retrieve({
      locale: Iyzipay.LOCALE.EN,
      conversationId: conversationId,
      token: token
    }, function (err, result) {
      console.log(err, result)
      // var status = result.status
      // var errorCode = result.errorCode
      // var errorMessage = result.errorMessage
      // var message
      if (result.status === 'success') {
        // message = res.__('Payment process is succeed!')
        req.getConnection(function (err, connection) {
          if (err) return next(err)
          connection.query(
            'UPDATE translation_session set is_paid = 1 WHERE id = ? ',
            [conversationId], function (err, rows) {
              if (err) return next(err)
            })
        })
      } else {
        // message = errorMessage
      }

      res.redirect('/dashboard')
    })
  })

  app.post('/payment', function (req, res) {
    var iyzipay = new Iyzipay(
      config.get('iyzico_client.api')
    )

    function paymentForm (done) {
      var request = {
        locale: Iyzipay.LOCALE.EN,
        conversationId: req.body.sessionId,
        price: req.body.amount,
        paidPrice: req.body.amount,
        //  currency: Iyzipay.CURRENCY.TRY,
        currency: req.body.currency,
        basketId: '',
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: config.get('iyzico_client.callbackUrl'),
        enabledInstallments: [2, 3, 6, 9],
        buyer: {
          id: 'BY789',
          name: 'John',
          surname: 'Doe',
          gsmNumber: '+905350000000',
          email: 'email@email.com',
          identityNumber: '74300864791',
          lastLoginDate: '2015-10-05 12:43:35',
          registrationDate: '2013-04-21 15:12:09',
          registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
          ip: '85.34.78.112',
          city: 'Istanbul',
          country: 'Turkey',
          zipCode: '34732'
        },
        // shipping address is same with billing addrress
        shippingAddress: {
          contactName: req.body.billingAddress.firstName + ' ' +
          req.body.billingAddress.lastName,
          city: req.body.billingAddress.city,
          country: req.body.billingAddress.country,
          address: req.body.billingAddress.address,
          zipCode: req.body.billingAddress.pinCode
        },
        billingAddress: {
          contactName: req.body.billingAddress.firstName + ' ' +
          req.body.billingAddress.lastName,
          city: req.body.billingAddress.city,
          country: req.body.billingAddress.country,
          address: req.body.billingAddress.address,
          zipCode: req.body.billingAddress.pinCode
        },
        basketItems: [
          {
            id: 'BI101',
            name: 'Binocular',
            category1: 'Collectibles',
            category2: 'Accessories',
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
            price: '0.2'
          },
          {
            id: 'BI102',
            name: 'Game code',
            category1: 'Game',
            category2: 'Online Game Items',
            itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
            price: '125'
          },
          {
            id: 'BI103',
            name: 'Usb',
            category1: 'Electronics',
            category2: 'Usb / Cable',
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
            price: '24.8'
          }
        ]
      }

      iyzipay.checkoutFormInitialize.create(request, function (err, result) {
        console.log(err, result)
        conversationId = result.conversationId
        token = result.token
        done(result)
      })
    }

    paymentForm(function (result) {
      res.send(result.paymentPageUrl)
    })
  })
}
