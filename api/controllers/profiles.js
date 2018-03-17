const User = require('mongoose').model('user');

module.exports.preloadProfileId = (req, res, next, username) => {
  User
    .findOne({username: username})
    .then(user => {
      if(!user){return res.sendStatus(404);}

      req.profile = user;

      return next();
    })
    .catch(next);
}

module.exports.getProfile = (req, res, next) => {
  if(req.payload.id) {
    User
      .findById(req.payload.id)
      .then(user => {
        if(!user){return res.json({profile: req.profile.toProfileJSONFor(false)});}

        return res.json({profile: req.profile.toProfileJSONFor(user)})
      });
  } else {
    return res.json({profile: req.profile.toProfileJSONFor(false)});
  }
}

module.exports.followUser = (req, res, next) => {
  const profileId = req.profile._id;
  const profile = req.profile;

  User
    .findById(req.payload.id)
    .then(user => {
      if(!user) {return res.sendStatus(401)}

      return user.follow(profileId).then(() => {
        return user.addFollower(profile, user).then(() => {
          return user.updateFollowerCount(profile).then(() => {
            return res.json({profile: req.profile.toProfileJSONFor(user)})
          })
        })
      })
    })
    .catch(next)
}

// return req.post.updateFavoriteCount().then(post => {
//   return res.json({post: post.toJSONFor(user)})

module.exports.unfollowUser = (req, res, next) => {
  const profileId = req.profile._id;
  const profile = req.profile

  User
    .findById(req.payload.id)
    .then(user => {
      if(!user) {return res.sendStatus(401);}

      return user.unfollow(profileId).then(() => {
        return user.removeFollower(profile, user).then(()=> {
          return user.updateFollowerCount(profile).then(() => {
            return res.json({profile: req.profile.toProfileJSONFor(user)})
          })
        })
      })
    })
    .catch(next)
}