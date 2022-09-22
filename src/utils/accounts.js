const mongoose = require('mongoose')

const accountSchema = new mongoose.Schema(
{
  user_id: {
    type: Number,
    required: true,
  },
  user_name: {
    type: String,
    required: true,
  },
  user_token: {
    type: String,
    required: true,
  },
  user_status: {
    type: Number,
    required: true,
  },
  createdAt:{
    type: Date,
     default: Date.now(),
  },
}, 
{
  timestamps:  true
})

//accountSchema.index({createdAt: 1},{expireAfterSeconds: 24*60*60,partialFilterExpression : {user_status: 0}});

module.exports = mongoose.model('Account', accountSchema)