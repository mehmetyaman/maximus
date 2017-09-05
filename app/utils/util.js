/**
 * Created by kaplan on 23.08.2017.
 */

module.exports = {
  sendVerificationEmail: function (req, user, res, emailserver, next) {
    emailserver.send({
      text: 'Linpret Email Verification link:' + req.protocol + '://' +
      req.get('host') + '/verify-email?token=' + user.email_verification_code,
      from: 'linpretinfo@gmail.com',
      to: user.email,
      //   cc: "semih.kahya08@gmail.com",
      subject: 'Linpret Email Verification'
    }, function (err, message) {
      return next(err)
    })
  }
}
