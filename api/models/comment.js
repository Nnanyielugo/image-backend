const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  body: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  post: {type: mongoose.Schema.Types.ObjectId, ref: 'post'}
}, {timeStamps: true});

CommentSchema.methods.toJSONFor = function(user) {
  return {
    id: this.id,
    body: this.body,
    createdAt: this.createdAt,
    author: this.author.toProfileJSONFor(user)
  }
}

const Comment = mongoose.model('comment', CommentSchema);
module.exports = Comment;