const router = require('express').Router()

const auth = require('../auth/auth');
const profiles = require('../controllers/profiles')

// preload user profile on routes with ':username'
router.param('username', profiles.preloadProfileId)
router.get('/:username', auth.optional, profiles.getProfile)
router.post('/:username/follow', auth.required, profiles.followUser)
router.delete('/:username/follow', auth.required, profiles.unfollowUser)

module.exports = router;