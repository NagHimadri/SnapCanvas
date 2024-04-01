var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer');
const methodOverride = require("method-override");

passport.use(new localStrategy(userModel.authenticate()));
router.use(methodOverride("_method"));

router.get('/', function(req, res, next) {
  res.render('index', {nav: false}); //if nav is false then don't show the navbar else show it
});

router.get('/register', function(req, res, next) {
  res.render('register', {nav: false});
});

router.get('/profile', isLoggedIn , async function(req, res, next) {
  const user = await userModel
  .findOne({username: req.session.passport.user}) //First we find the user from database
  .populate("posts");
  res.render('profile', {user, nav: true}); //Then render that user's profile
});

router.get('/show/posts', isLoggedIn , async function(req, res, next) {
  const user = await userModel
  .findOne({username: req.session.passport.user}) //First we find the user from database
  .populate("posts");
  res.render('show', {user, nav: true}); //Then render that user's profile
});



router.get('/feed', isLoggedIn , async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}) //First we find the user from database
  const posts = await postModel.find()
  .populate("user") //By doing this all posts come into our 'posts'
  res.render("feed", {user, posts, nav:true});
});

router.get('/add', isLoggedIn , async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('add', {user, nav: true});
});

router.post('/createpost', isLoggedIn ,upload.single("postimage") , async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    user: user._id, //Give the post's unique id to the postSchema's user object which will refer to the userSchema as post should know who is user
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  });

  user.posts.push(post._id); //Give the post's unique id to the userSchema's post array which will refer to the postSchema as user should also maintain a track record that what are his post
  await user.save(); //Manually save this
  res.redirect("/profile");
});

router.post('/fileupload', isLoggedIn, upload.single("image") , async function(req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user}); //First we find the user from database
  user.profileImage = req.file.filename; //Add the image to that user's profileImage
  await user.save(); //manually save that for that user
  res.redirect("/profile"); //redirect to the profile page
});

router.delete("/delete/:id",isLoggedIn, async function(req, res) {
  let {id} = req.params;
  await postModel.findByIdAndDelete(id);
  res.redirect("/show/posts");
});

router.post('/register', function(req, res, next) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    // contact: req.body.contact
    name: req.body.fullname
  })
  
  userModel.register(data, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/profile");
    })
  })
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile",
}) , function(req, res, next) {
});

router.get("/logout", function(req, res){
  req.logout(function(err){
    if(err) { return next(err); }
    res.redirect('/');
  })
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}

module.exports = router;
