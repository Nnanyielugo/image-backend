const router = require('express').Router();

const upload = require('../multer').upload;
const auth = require('../auth/auth');
const user = require('../controllers/users');

router.get('/user', auth.required, user.getUser);
router.post('/', upload.single('imageSrc'), user.signUp);
router.post('/login', user.login);
router.put('/user', upload.single('imageSrc'), auth.required, user.updateUser);

module.exports = router;