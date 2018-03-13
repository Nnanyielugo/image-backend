const router = require('express').Router();
const mongoose = require('mongoose');
const Post = mongoose.model('post')

module.exports.getTags = (req, res, next) => {
  Post
    .find()
    .distinct('tags')
    .then(tags => {
      return res.json({tags: tags})
    })
    .catch(next);
}