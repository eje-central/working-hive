const mongoose = require('mongoose')
const Schema = mongoose.Schema

const proyectoSchema = new Schema({
  nombre: String,
  descripcion: String,
  etapas: Array, 
  cotizacion: Number, 
  fechaInicio: Date,
  fechaFin: Date,
  color: String
}, {
    timestamps: {
      createdAt: "created_at", updatedAt: "updated_at"
    }
  })

const Proyecto = mongoose.model('Proyecto', proyectoSchema)

module.exports = Proyecto;