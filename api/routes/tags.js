const router = require('express').Router();

const tags = require('../controllers/tags');

router.get('/', tags.getTags);

module.exports = router;