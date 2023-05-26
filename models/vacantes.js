const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slug');
const shortId = require('shortid');

const vacantesSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: 'El nombre de la vacante es obligatorio',
        trim: true
    },
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        required: 'La ubivacion es oligatoria',
        trim: true
    },
    salario: {
        type: String,
        default:0,
        trim: true
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion : {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true
    },
    skills: [String],
    candidatos:[{
        nombre: String,
        email: String,
        telefono: String,
        cv: String
    }],
    autor: {
        type: mongoose.Schema.ObjectId, 
        ref: 'Usuarios',
        required: 'El autor es obligatorio'
    }
});

vacantesSchema.pre('save', function (next) {

    //Crear URL
    const url = slug(this.titulo);
    this.url = `${url}-${shortId.generate()}`;

    next();
});

//crear un indice
vacantesSchema.index({ titulo: 'text' })

module.exports = mongoose.model('Vacante', vacantesSchema)