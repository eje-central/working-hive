const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  correo: String,
  name: String,
  password: String,
  rol_id: Number,
  sueldo: Number,
  pm: Boolean,
}, {
    timestamps: {
      createdAt: "created_at", updatedAt: "updated_at"
    }
  })

const User = mongoose.model('User', userSchema)

module.exports = User;
