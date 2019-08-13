var express = require('express');
var userController = require('../controllers/user.js')

var router = express.Router();
var multer  = require('multer')
var upload = multer({ dest: 'public/upload/' })// 图片地址
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login',userController.login);
router.post('/register',userController.register);
router.get('/verify',userController.verify);
router.get('/logout',userController.logout);
router.get('/getUser',userController.getUser);
router.post('/updatePassword',userController.updatePassword);
router.get('/verifyImg',userController.verifyImg)

router.post('/uploadUserHead',upload.single('file'),userController.uploadUserHead);
module.exports = router;
