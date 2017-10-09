/**
 * Created by kaplan on 23.08.2017.
 */

module.exports = {
  sendVerificationEmail: function (req, user, res, emailserver, next) {
    emailserver.send({
      text: 'Linpret Email Verification link:' + req.protocol + '://' +
      req.get('host') + '/verify-email?token=' + user.email_verification_code,
      from: 'info@linpret.com', 
      to: user.email,
      cc: "mehmetyaman@gmail.com",
      subject: 'Linpret Email Verification'
    }, function (err, message) {
      return next(err)
    })
  }
}
