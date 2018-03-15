const router = require('express').Router();
const Post = require('mongoose').model('post');
const Comment = require('mongoose').model('comment');

const upload = require('../multer').upload;
const auth = require('../auth/auth');
const post = require('../controllers/post');


router.get('/', post.getPosts);
router.post('/', upload.single('imgSrc'), post.createPosts);

// Preload post objects on routes with ':post'
router.param('post', (req, res, next, slug) => {
  Post.findOne({slug: slug})
  .then(post => {
    if(!post) {return res.status(404).json({Message: "Post does not exist!"});}
    return res.status(200).json({Post: post})
    // req.post = post;
    // return next()
  })
  .catch(next)
})

router.get('/:post', post.getPost);

// preload comment objects on routes with ':comment'
router.param('comment', function(req, res, next, id) {
  Comment.findById(id).then(function(comment){
    if(!comment) { return res.status(404).json({Message: "Comment does not exist"}) ; }

    req.comment = comment;
    return next();
  }).catch(next);
});

router.get('/:post/comments', post.getComments);

module.exports = router;