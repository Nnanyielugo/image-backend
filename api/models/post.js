const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug');
const User = mongoose.model('user');

const PostSchema = new mongoose.Schema({
  slug: {
    type: String,
    lowercase: true,
    unique: true
  },
  title: {type: String, required: true},
  post: {
    type: String
  },
  favoritesCount: {type: Number, default: 0},
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'comment'}],
  imgSrc: String,
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'user'}, 
  tags: [String]
}, {timestamps: true});

PostSchema.plugin(uniqueValidator, {errors: 'is already taken'});

PostSchema.pre('validate', function(next) {
  if(!this.slug) {
    this.slugify()
  }

  next();
});

PostSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
}  

// update favoritesCount and save to db
PostSchema.methods.updateFavoriteCount = function() {
  const post = this;

  return User
    .count({favorites: {$in: [post.id]}})
    .then(function(count){
      post.favoritesCount = count;

      return post.save()
    })
}

//return single post with populated author, and favorites information
PostSchema.methods.toJSONFor = function(user) {
  return {
    slug: this.slug,
    title: this.title,
    post: this.post,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tags: this.tags,
    imgSrc: this.imgSrc,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user)
  }
}

const Post = mongoose.model('post', PostSchema);
module.exports = Post;