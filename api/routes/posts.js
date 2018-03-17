const router = require('express').Router();

const upload = require('../multer').upload;
const auth = require('../auth/auth');
const post = require('../controllers/post');



/**  PRELOAD POST AND COMMENT OBJECTS ON ROUTES WITH ':post' and ':comment' respectively  */
router.param('post', post.preloadPostId)

router.param('comment', post.preloadCommentId);


/** ROUTES */
router.get('/', auth.optional, post.getPosts);
router.post('/', upload.single('imgSrc'), auth.required, post.createPosts);
router.get('/:post', auth.optional, post.getPost);
router.put('/:post', upload.single('imgSrc'), auth.required, post.updatePost);
router.delete('/:post', auth.required, post.deletePost)

router.get('/:post/comments', auth.optional, post.getComments);
router.post('/:post/comments', auth.required, post.makeComment)
router.delete('/:post/comments/:comment', auth.required, post.deleteComment)

router.post('/:post/favorite', auth.required, post.favPost)
router.delete('/:post/favorite', auth.required, post.unfavPost)

module.exports = router;