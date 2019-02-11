const mongoose = require('mongoose')
const Schema = mongoose.Schema

const rolSchema = new Schema({
  _id: Number,
  description: String, 
}, {
    timestamps: {
      createdAt: "created_at", updatedAt: "updated_at"
    }
  })

const Roles = mongoose.model("Roles", rolSchema);

module.exports = Roles;
