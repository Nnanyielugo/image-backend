const router = require('express').Router();
const mongoose = require('mongoose');

const Post = mongoose.model('post');
const User = mongoose.model('user');
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
  
  
  Promise.all([
    req.query.author ? User.findOne({username: req.query.author}) : null,
    req.query.favorited ? User.findOne({username: req.query.favorited}) : null
  ]).then(results => {
    // console.log("[RESULTS]: ", results)    
    const author = results[0];
    const favoriter = results[1];

    if(author) {
      query.author = author._id;
    }
    
    if(favoriter) {
      query._id = {$in: favoriter.favorites}
    } else if(req.query.favorited) {
      query._id = {$in: []}
    }
  })
  return Promise
    .all([
      Post
        .find(query)
        .limit(Number(limit))
        .skip(Number(offset))
        .sort({createdAt: 'desc'})
        .populate('author')
        .exec(), 
      Post.count(query).exec(),
      req.payload ? User.findById(req.payload.id): null,
    ])
    .then(results => {
      // console.log(results)
      const posts = results[0];
      const postsCount = results[1];
      const user = results[2];

      return res.json({
        posts: posts.map(function(post){
          return post.toJSONFor(user)
        }),
        postsCount: postsCount
      })
    })
    .catch(next)
}

module.exports.createPosts = (req, res, next) => {
  User
    .findById(req.payload.id)
    .then(user => {
      if(!user) {return res.sendStatus(401)}

      let path = null
      if(req.file) {
        path = req.file.path
      }

      // populate post request with the request body, request file path, and the user who makes the post
      const post = new Post({
        post: req.body.post,
        title: req.body.title,
        tags: req.body.tags,
        imgSrc: path,
        author: user
      });
      return post
      .save()
      .then(() => {
        return res.json({post: post.toJSONFor(user)})
      })
    })
    .catch(next);
}



module.exports.getPost = (req, res, next) => {
  console.log(req.post)
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.post.populate('author').execPopulate()
  ])
    .then(results => {
      const user = results[0];
      return res.json({post: req.post.toJSONFor(user)})
    })
    .catch(next);
}

module.exports.updatePost = (req, res, next) => {
  User
    .findById(req.payload.id)
    .then(user => {
      if(req.post.author._id.toString() === req.payload.id.toString()) {
        if(typeof req.body.title !== 'undefined'){
          req.post.title = req.body.title;
        }
  
        if(typeof req.body.post !== 'undefined'){
          req.post.post = req.body.post;
        }
  
        if(typeof req.body.tags !== 'undefined'){
          req.post.tags = req.body.tags
        }

        if(typeof req.file.path !== 'undefined'){
          req.post.imgSrc = req.file.path;
        }

        req.post.save()
          .then(post => {
            return res.json({post: post.toJSONFor(user)})
          })
          .catch(next)
      } else {
        return res.sendStatus(403);
      }
    })
}

module.exports.deletePost = (req, res, next) => {
  User
    .findById(req.payload.id)
    .then(user => {
      if(!user) {return res.sendStatus(401)}
      if(req.post.author._id.toString() === req.payload.id.toString()) {
        return req.post.remove().then(() => {
          return res.sendStatus(204)
        });
      } else {
        return res.sendStatus(403)
      }
    })
    .catch(next)
}

module.exports.getComments = (req, res, next) => {
  // create a new resolved promise
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null)
    .then(user => {
      return req.post.populate({
        path: 'comments',
        populate: {
          path: 'author'
        },
        options: {
          sort: {
            createdAt: 'desc'
          }
        }
      }).execPopulate()
        .then(post => {
          return res.json({comments: req.post.comments.map(comment => {
            return comment.toJSONFor(user)
          })})
        })
        .catch(next);
    })
}

module.exports.makeComment = (req, res, next) => {
  User
    .findById(req.payload.id)
    .then(user => {
      if(!user){return res.sendStatus(401);}

      const comment = new Comment(req.body.comment);
      comment.post = req.post;
      comment.author = user;

      return comment.save().then(() => {
        req.post.comments.push(comment);

        return req.post.save().then(() => {
          res.json({comment: comment.toJSONFor(user)})
        });
      });      
    })
    .catch(next);
}

module.exports.favPost = (req, res, next) => {
  const postId = req.post._id

  User
    .findById(req.payload.id)
    .then(user => {
      if(!user) {return res.sendStatus(410)}

      return user.favorite(postId).then(() => {
        return req.post.updateFavoriteCount().then(post => {
          return res.json({post: post.toJSONFor(user)})
        })
      })
    })
    .catch(next);
}

module.exports.unfavPost = (req, res, next) => {
  const postId = req.post._id;

  User
    .findById(req.payload.id)
    .then(user  => {
      if(!user){return res.sendStatus(401);}
      
      return user.unfavorite(postId).then(() => {
        return req.post.updateFavoriteCount().then(post => {
          return res.json({post: post.toJSONFor(user)})
        })
      })
    })
    .catch(next);
}
