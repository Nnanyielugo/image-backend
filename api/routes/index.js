const router = require('express').Router();
const multer = require('multer');

const auth = require('../auth/auth');

const Post = require('mongoose').model('post');

const post = require('../controllers/post');
const tags = require('../controllers/tags');
const user = require('../controllers/users');

// multer config
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  filename: function(req, file, cb) {
    cb(null, (Math.random() * Math.pow(36, 6) | 0).toString(36) + file.originalname);
  }
});

// multer filter config
const fileFIlter = (req, file, cb) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
}

// initialize multer and set upload file size
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFIlter
});



router.get('/tags', tags.getTags)

router.get('/posts', post.getPosts);
router.post('/posts', upload.single('imgSrc'), post.createPosts);

// Preload article objects on routes with ':post'
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

router.get('/posts/:post', post.getPost);

// preload comment objects on routes with ':comment'
router.param('comment', function(req, res, next, id) {
  Comment.findById(id).then(function(comment){
    if(!comment) { return res.status(404).json({Message: "Comment does not exist"}) ; }

    req.comment = comment;
    return next();
  }).catch(next);
});

router.get('/:article/comments', post.getComments);

router.get('/user', auth.required, user.getUser);
router.post('/users', user.signUp)
router.post('/users/login', user.login)
router.put('/user', upload.single('imageSrc'), auth.required, user.updateUser)

module.exports = router;