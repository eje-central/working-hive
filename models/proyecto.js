const mongoose = require('mongoose')
const Schema = mongoose.Schema

const proyectoSchema = new Schema({
  nombre: String,
  descripcion: String,
  etapas: [{
    nom: Array,
    responsable: [ { type : Schema.Types.ObjectId, ref: 'User' } ],
    tareas: [ { type : Schema.Types.ObjectId, ref: 'User' } ],
    finalizada: String
  }],
  cotizacion: Number,
  pesos: String, 
  fechaInicio: Date,
  fechaFin: Date,
  color: String,
  finalizado: String
}, {
    timestamps: {
      createdAt: "created_at", updatedAt: "updated_at"
    }
  })

const Proyecto = mongoose.model('Proyecto', proyectoSchema)

module.exports = Proyecto;