const router = require('express').Router();

const post = require('../controllers/post');

router.get('/', post.getPosts);
router.post('/', post.createPosts);

module.exports = router;