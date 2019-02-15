const mongoose = require('mongoose')
const Schema = mongoose.Schema

const etapaSchema = new Schema({
  nombre: String,
  responsable: [ { type : Schema.Types.ObjectId, ref: 'User' } ],
})

const Etapa = mongoose.model('Etapa', etapaSchema)

module.exports = Etapa;