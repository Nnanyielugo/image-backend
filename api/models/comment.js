const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  body: String,
  author: {type: String},
  post: {type: mongoose.Schema.Types.ObjectId, ref: 'post'}
}, {timeStamps: true});

const Comment = mongoose.model('comment', CommentSchema);
module.exports = Comment;