const router = require('express').Router();
const mongoose = require('mongoose');

const Post = mongoose.model('post');
const Comment = mongoose.model('comment');



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
        .exec(), 
      Post.count(query).exec()
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

  console.log("[file]", req.file)
  console.log("[body]", req.body)
  let path = null
  if(req.file) {
    path = req.file.path
  }

  const post = new Post({
    post: req.body.post,
    title: req.body.title,
    tags: req.body.tags,
    imgSrc: path
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



module.exports.getPost = (req, res, next) => {
  Promise.all([])
    .then(results => {
      return res.json(results)
    })
    .catch(next);
}

module.exports.getComments = (req, res, next) => {
  // create a new resolved promise
  Promise.resolve()
    .then(user => {
      return req.post.populate({
        path: 'comments',
        options: {
          sort: {
            createdAt: 'desc'
          }
        }
      }).execPopulate()
        .then(article => {
          return res.json({comments: req.article.comments.map(comment => {
            return comment
          })})
        })
        .catch(next);
    })
}