const mongoose = require('mongoose');
const Post = mongoose.model('post');

module.exports.getPosts = (req, res, next) => {
  Post
    .find()
    .exec()
    .then(posts => {
      if(posts.length > 0) {
        res.status(200).json(posts)
      } else {
        res.status(200).json({
          message: "No posts in database. Make post?"
        })
      }
    })
    .catch(err => {
      res.status(500).json(err);
      console.log(err)
    })
}

module.exports.createPosts = (req, res, next) => {
  const post = new Post({
    _id: new mongoose.Types.ObjectId(),
    post: req.body.post
  });
  
  post
    .save()
    .then(result => {
      console.log(result)
      res.status(201).json({
        createdPost: result
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json(err);
    });
}