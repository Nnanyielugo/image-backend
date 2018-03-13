const router = require('express').Router();

const post = require('../controllers/post');
const tags = require('../controllers/tags');

router.get('/tags', tags.getTags)
router.get('/posts', post.getPosts);
router.post('/posts', post.createPosts);

module.exports = router;