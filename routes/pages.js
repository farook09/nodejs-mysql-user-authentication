const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

router.get('/',authController.isLoggedIn,(req,res) => {
  console.log("Inside");
  console.log(req.user);
  res.render('index',{
    user: req.user
  });
});

router.get('/profile',authController.isLoggedIn,(req, res) => {
  console.log('Inside');
  console.log(req.user);
  if (req.user){
    res.render('profile',{
      user: req.user
    });
  } else {
    res.redirect('/login');
  }
});

router.get('/register',(req,res) => {
  res.render('register');
});

router.get('/login',(req,res) => {
  res.render('login');
});

module.exports=router;
