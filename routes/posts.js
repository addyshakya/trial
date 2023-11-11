var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
   postsimage: {
      type: String
   },
 postdets: String,
 users:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "users"
 },
 like:[{
    type:mongoose.Schema.Types.ObjectId,
    ref: "users"
 }],
 date:{
    type: Date,
    default: Date.now
 }
})

module.exports = mongoose.model('posts', postSchema);