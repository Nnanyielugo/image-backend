const User = require('mongoose').model('user');
const passport = require('passport');

module.exports.getUser = (req, res, next) => {
  console.log(req.payload)
  User
    .findById(req.payload.id)
      .then(user => {
        if(!user) {return res.sendStatus(401)}

        return res.json({user: user.toAuthJSON()})
      })
      .catch(next)
}

module.exports.signUp = (req, res, next) => {
  const user = new User()
  if(typeof req.file !== 'undefined'){
    user.imageSrc = req.file.path;
  }
  user.username = req.body.username;
  user.email = req.body.email;
  user.setPassword(req.body.password);

  user
    .save()
    .then(() => {
      return res.json({user: user.toAuthJSON()});
    })
    .catch(next);
}

module.exports.login = (req, res, next) => {
  console.log(req.body)
  //console.log(req.payload)
  if(!req.body.user.email){
    return res.status(422).json({errors: {error: "Email can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {error: "Password can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
};

module.exports.updateUser = (req, res, next) => {
  console.log(req.payload)
  // find user by the id returned in the jwt payload
  User
    .findById(req.payload.id)
    .then(user => {
      if(!user) {return res.sendStatus(401)}
      console.log(req.body)
      console.log(req.file)
      // only update fields that were actually passed
      if(typeof req.body.username !== 'undefined') {
        user.username = req.body.username;
      }
      if(typeof req.body.email !== 'undefined'){
        user.email = req.body.email;
      }
      if(typeof req.body.bio !== 'undefined'){
        user.bio = req.body.bio;
      }
      if(typeof req.file.path !== 'undefined'){
        user.imageSrc = req.file.path;
      }
      if(typeof req.body.password !== 'undefined'){
        user.setPassword(req.body.user.password);
      }

      return user
        .save()
        .then(() => res.json({user: user.toAuthJSON()}))
    })
    .catch(next)
}

// the login data is wrapped in a user object and should be accessed by 'req.body.user.property_value'
// user edit and signup are not(thankfully), and can be accessed via 'req.body.property_value