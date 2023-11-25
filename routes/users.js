var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/demo-insta')

var userSchema = mongoose.Schema({
  username:String,
  password:String,
  email:String,
  number:Number,
  profileimage: {
    type: String,
    default: 'default.jpeg'
  },
  like:{
    type: Array,
    default: []
  } ,
  bio:{
    type: String
  },
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref: "posts"
  }],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    }
  ],
})

userSchema.plugin(plm);
module.exports = mongoose.model('users', userSchema);