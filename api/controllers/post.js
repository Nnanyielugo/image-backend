const mongoose = require('mongoose');
const Post = mongoose.model('post');
const router = require('express').Router()

router.param('post', (req, res, next, slug) => {
  Post.findOne({slug: slug})
  then(post => {
    if(!post) {return res.sendStatus(404);}
    req.post = post;
    return next()
  })
  .catch(next)
})

module.exports.getPosts = (req, res, next) => {
  let query = {};
  let limit = 20;
  let offset = 0;
  if (typeof req.query.limit !== 'undefined') {
    limit = req.query.limit;
  }

  if(typeof req.query.offset !== 'undefined') {
    offset = req.query.offet;
  }

  if (typeof req.query.tag !== 'undefined') {
    query.tags = {"$in": [req.query.tag]};
  }

  // create a promise that is resolved with an array of results when
  // all of the provided promises resolve, or is rejected when 
  // any promise is rejected
  return Promise
    .all([
      Post
        .find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'})
        .exec(), Post.count(query).exec()
    ])
    .then(results => {
      console.log(results)
      const posts = results[0];
      const postsCount = results[1];

      return res.json({
        posts: posts,
        postsCount: postsCount
      })
    })
    .catch(next)
}

module.exports.createPosts = (req, res, next) => {
  const post = new Post(req.body);
  
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