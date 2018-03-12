const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  post: {
    type: String
  }
});

const Post = mongoose.model('post', postSchema);
module.exports = Post;