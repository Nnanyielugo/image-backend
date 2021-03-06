const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../../config/config').SECRET;

const UserSchema = new mongoose.Schema({
  username: {type: String, 
              lowercase: true,
              unique: true, 
              required: [true, "can't be blank"], 
              match: [/^[a-zA-Z0-9]+$/, 'is invalid'], 
              index: true},
  email: {type: String, 
            lowercase: true, 
            unique: true, 
            required: [true, "can't be blank"], 
            match: [/\S+@\S+\.\S+/, 'is invalid'], 
            index: true},
  bio: String,
  imageSrc: {type: String, default: './uploads/placeholder.jpeg'},
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  followers: [{type: String}],
  followerCount: {type: Number, default: 0},
  hash: String,
  salt: String
}, {timestamps: true});

UserSchema.plugin(uniqueValidator, {message: '{PATH} is already taken.'});

// validate password
UserSchema.methods.validPassword = function(password){
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
}

// set password
UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
}

// generate auth token
UserSchema.methods.generateJWT = function(){
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);
  
  return jwt.sign({
    id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000)
  }, secret);
}

// generate json representation of user for authentication
UserSchema.methods.toAuthJSON = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    imageSrc: this.imageSrc,
  }
}

// return selected user properties to populate single post author field
UserSchema.methods.toProfileJSONFor = function(user) {
  return {
    username: this.username,
    bio: this.bio,
    imageSrc: this.imageSrc,
    following: user ? user.isFollowing(this._id) : false,
    followers: this.followers,
    followerCount: this.followerCount
  }
}

UserSchema.methods.favorite = function(id){
  if(this.favorites.indexOf(id) === -1){
    this.favorites.unshift(id);
    // this.favorites.push(id);
  }

  return this.save();
}

UserSchema.methods.addFollower = function(profile, user) {
  profile.followers.unshift(user._id)

  return profile.save()
}

UserSchema.methods.removeFollower = function(profile, user) {
    profile.followers.remove(user._id)

    return profile.save()
}

UserSchema.methods.updateFollowerCount = function(profile) {
  return User
    .count({followers: {$in: [profile.id]}})
    .then(function(){
      profile.followerCount = profile.followers.length
      return profile.save()
    })
}

UserSchema.methods.unfavorite = function(id){
  this.favorites.remove(id);
  return this.save();
}

UserSchema.methods.isFavorite = function(id) {
  return this.favorites.some(function(favoriteId){
    return favoriteId.toString() === id.toString();
  })
}

UserSchema.methods.follow = function(id){
  // if index of user id is less then zero (ie, not exist), push id into 'following' array
  // console.log(id)
  if(this.following.indexOf(id) === -1){
    this.following.unshift(id);
  }

  return this.save()
}

UserSchema.methods.unfollow = function(id) {
  this.following.remove(id);
  return this.save()
}

UserSchema.methods.isFollowing = function(id) {
  return this.following.some(function(followId){
    return followId.toString() == id.toString();
  });
}

const User = mongoose.model('user', UserSchema);

module.exports = User;

// NB: using arrow functions in mongoose schema methods returns the 'this' reference to them as undefined 