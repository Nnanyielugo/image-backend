const router = require('express').Router();
const Post = require('mongoose').model('post');
const Comment = require('mongoose').model('comment');

const upload = require('../multer').upload;
const auth = require('../auth/auth');
const post = require('../controllers/post');



/**  PRELOAD POST AND COMMENT OBJECTS ON ROUTES WITH ':post' and ':comment' respectively  */
router.param('post', (req, res, next, slug) => {
  Post.findOne({slug: slug})
  .populate('author')
  .then(post => {
    if(!post) {return res.status(404).json({Message: "Post does not exist!"});}
    // return res.status(200).json({Post: post})
    req.post = post;
    return next()
  })
  .catch(next)
})

router.param('comment', function(req, res, next, id) {
  Comment.findById(id).then(function(comment){
    if(!comment) { return res.status(404).json({Message: "Comment does not exist"}) ; }

    req.comment = comment;
    return next();
  }).catch(next);
});


/** ROUTES */
router.get('/', auth.optional, post.getPosts);
router.post('/', upload.single('imgSrc'), auth.required, post.createPosts);
router.get('/:post', auth.optional, post.getPost);
router.put('/:post', upload.single('imgSrc'), auth.required, post.updatePost);
router.delete('/:post', auth.required, post.deletePost)

router.get('/:post/comments', auth.optional, post.getComments);

module.exports = router;