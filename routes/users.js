var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/instagram')

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
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref: "posts"
  }]
})

userSchema.plugin(plm);
module.exports = mongoose.model('users', userSchema);