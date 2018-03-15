const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const slug = require('slug');

const PostSchema = new mongoose.Schema({
  slug: {
    type: String,
    lowercase: true,
    unique: true
  },
  title: String,
  post: {
    type: String
  },
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'comment'}],
  imgSrc: String,
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'user'}, 
  tags: [{type: String}]
}, {timestamps: true});

PostSchema.plugin(uniqueValidator, {message: 'is already taken'});

PostSchema.pre('validate', function(next) {
  if(!this.slug) {
    this.slugify()
  }

  if (this.tag){
    this.tag.split(",")
  }
  next();
});

PostSchema.methods.slugify = function() {
  this.slug = slug(this.title) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36)
}  


// postSchema.methods.updateLikesCount = () => {
//   const article = this;

//   return 
// }

const Post = mongoose.model('post', PostSchema);
module.exports = Post;