const multer = require('multer');

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
module.exports.upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFIlter
});