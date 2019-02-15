const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  username: String,
  name: String,
  password: String,
  // rol: Number,
  rol: [{ type: Schema.Types.ObjectId, ref: 'Roles' }],
  salary: Number,
  pm: Boolean,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
    timestamps: {
      createdAt: "created_at", updatedAt: "updated_at"
    }
  })

const User = mongoose.model('User', userSchema)

module.exports = User;
