const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('mongoose').model('user');

// login
passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, (email, password, done) => {
  User.findOne({email: email})
    .then(user => {
      if(!user || !user.validPassword(password)){
        return done(null, false, {'email or password': 'is invalid'})
      }

      return done(null, user)
    })
    .catch(done)
}))

// configure Passport to authenticate users with email and password, 
// and then we made two JWT middlewares, one for requests that require authentication, 
// and the other for requests where authentication is optional.