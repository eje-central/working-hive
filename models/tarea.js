const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tareaSchema = new Schema({
    nom: String,
    responsable: [ { type : Schema.Types.ObjectId, ref: 'User' } ],
    fechaI: Date,
    fechaC: Date,
    fechaF: Date,
    finalizada: String, 
    grado: Number,
    creador: [ { type : Schema.Types.ObjectId, ref: 'User' } ]
}, {
  timestamps: {
    createdAt: "created_at"
  }})

const Tarea = mongoose.model('Tarea', tareaSchema)

module.exports = Tarea;