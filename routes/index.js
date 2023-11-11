var express = require('express');
var GoogleStrategy = require('passport-google-oidc');
const passport = require('passport');
require('dotenv').config();
var router = express.Router();
var userModel = require('./users.js');
var postModel = require('./posts.js');
const localStrategy = require('passport-local');
var multer = require('multer')
var path = require('path');
const users = require('./users');
const posts = require('./posts.js');

passport.use(new localStrategy(userModel.authenticate()))

// passport.use(new GoogleStrategy({
//   clientID: process.env['GOOGLE_CLIENT_ID'],
//   clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
//   callbackURL: '/oauth2/redirect/google',
//   scope: [ "email",  'profile' ]
// },async function verify(issuer, profile, cb) {
//   let existingUser =  await users.findOne({email:profile.emails[0].value})
  
//   if(existingUser){
//     return cb(null,existingUser);
//   }
//   else{
//     let newUser = await users.create({name:profile.displayName, email:profile.emails[0].value})
//     return cb(null, newUser);
//   }
// })); 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    var dt = new Date();
    var fn = Math.floor(Math.random()*1000000) + dt.getTime() + path.extname(file.originalname);
    cb(null,fn )
  }
})

function fileFilter (req, file, cb) {

  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp' || file.mimetype === 'image/svg' || file.mimetype === 'image/jpg') {
    cb(null, true)
  }
  else{
    cb(new Error('Please upload image !!!'), false)
  }

}

const upload = multer({ storage: storage , fileFilter:fileFilter})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/uploads', isLoggedIn, upload.single('filename'), function(req, res, next) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedIn){
    loggedIn.profileimage = req.file.filename;
    loggedIn.save()
    .then(function(){
      res.redirect('back')
    })
  })
});

router.get('/username/:username',(req,res)=>{
  console.log(req.params.username)
  userModel.findOne({username:req.params.username}).then((userFound)=>{
    if(userFound){
      res.json({found:true});
    }
    else{
      res.json({found:false});
    }
  })
})


router.get('/signup', function(req, res, next) {
  res.render('signup', { title: 'Express' });
});

router.get('/feed', function(req, res, next) {
    userModel.find()
    postModel.find()
    .then(function(user,post){
      console.log(post)
      res.render("feed", {user,post})
    })
});

router.get('/home', isLoggedIn ,function(req,res,next){
  userModel.findOne({
    username:req.session.passport.user
  })
  .populate({
    path: "posts",
      populate: {
        path: "users"
      }
  })
  .then(function(user){
    postModel.find()
    .populate('users')
    .then(function(post){
      console.log(post)
      res.render("home", {user,post})
    })
    // res.json({user:user})
  })
})

router.get('/profile',isLoggedIn, function(req, res, next) {
  userModel.findOne({username: req.session.passport.user})
  .populate({
    path: "posts",
    populate:{
      path: "users"
    }
  })
  .then(function(users){
    postModel.find()
    .populate('users')
    .then(function(post){
      console.log(post);
      res.render('profile', {users,post})
    })
  })
});

router.get("/createpost",isLoggedIn, function(req,res,next){
  userModel.findOne({username:req.session.passport.user})
  .then(function(users){
    res.render('createpost', {users:users}, )
  })
})

router.get("/message", function(req,res){
  userModel.findOne({username:req.session.passport.user})
    .then(function(users){
      res.render('message', {users})
    })
})

router.post("/posts", isLoggedIn, upload.single('postsimage'), function(req,res,next){
  userModel.findOne({username:req.session.passport.user})
  .then(function(loggedInUser){
    postModel.create({
      postdets:req.body.postdets,
      users:loggedInUser._id,
      postsimage: req.file.filename,
    })
    .then(function(posts){
      loggedInUser.posts.push(posts._id),
      loggedInUser.save()
      .then(function(post){
        res.redirect("/home")
      })
    })
  })
})

router.get('/like/:id',isLoggedIn, async function(req, res, next) {
  var post = await postModel.findOne({_id:req.params.id})
  var user = await userModel.findOne({username: req.session.passport.user})  
  var indexcheck = post.like.indexOf(user._id);
  // console.log(post)
  if(indexcheck === -1){
   post.like.push(user._id);
  }
  else{
   post.like.splice(indexcheck, 1);
  }
  await post.save()
   res.redirect('back')
});

router.post('/register', function(req, res, next) {
  var userCreated = new userModel({
    username: req.body.username,
    email:req.body.email,
    number:req.body.number,
    profileimage:req.body.profileimage
  })
  userModel.register(userCreated,req.body.password)
    .then(function(u){
      passport.authenticate('local')(req,res,function()
      {
        res.redirect('/home')
      })
    })
});

router.get("/username/:username", (req, res) => {
  userModel.findOne({ username: req.params.username }).then((val) => {
    if (val) {
      res.json({ found: true });
    } else {
      res.json({ found: false });
    }
  });
});

router.get('/show/:username',(req,res)=>{
const regex = new RegExp("^" + req.params.username);
  userModel.find({username:regex}).then((getUsers)=>{
    res.json({allUsers:getUsers});
  })
})


router.post('/login', passport.authenticate('local',{
  successRedirect: '/home',
  failureRedirect: '/'
}), function(req,res,next) { });


router.get('/logout', function(req,res){
  res.redirect('/')
})

function isLoggedIn(req,res,next)
{
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect('/');
  }
}

router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/home',
  failureRedirect: '/login'
}));

module.exports = router;