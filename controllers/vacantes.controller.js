const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const vacantes = require('../models/vacantes');
const { body, validationResult } = require("express-validator"); 
const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina:  'Nueva vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

//Agregar las vacantes a la BD

exports.aregarVacante = async (req, res) => {
    const vacante  = new Vacante(req.body)

    //Usario autor de la vacante
    vacante.autor = req.user._id;

    //Crear arreglo de skills
    vacante.skills = req.body.skills.split(',')
    
    //Almacenarlo en la BD
    const nuevaVacante = await vacante.save();

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);

}

exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).populate('autor')

    console.log(vacante);

    //Si no hay resultado
    if(!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina : vacante.titulo,
        barra: true
    })
}

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });

    if(!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina : `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body
    vacanteActualizada.skills = req.body.skills.split(',');
    
    const vacante = await Vacante.findOneAndUpdate({url:req.params.url}, 
        vacanteActualizada, {
            new: true,
            runValidators: true
        });

    res.redirect(`/vacantes/${vacante.url}`)
}

//Validar y sanitizar los campos de las vacantes
exports.validarVacante = async (req, res, next) => {
    const rules = [
        body("titulo").not().isEmpty().withMessage("Agrega un titulo a la vacante").escape(),
        body("empresa").not().isEmpty().withMessage("Agrega una empresa").escape(),
        body("ubicacion")
          .not()
          .isEmpty()
          .withMessage("Agregue una ubicación")
          .escape(),
        body("contrato")
          .not()
          .isEmpty()
          .withMessage("Seleccione un tipo de contrato")
          .escape(),
        body("skills")
        .not()
        .isEmpty()
          .withMessage("Agregar una o más habilidades")
          .escape(),
      ];
      await Promise.all(rules.map(validation => validation.run(req)));
      const errores = validationResult(req);
      console.log('aqui estan los errores',errores);
  
 
  if (!errores.isEmpty()) {
    // Recargar pagina con errores
    req.flash('error', errores.array().map(error =>  error.msg));

    res.render("nueva-vacante", {
      nombrePagina: "Nueva vacante",
      tagline: "Llena el formulario y publica tu nueva vacante",
      nombre: req.user.name,
      mensajes: req.flash()
    });
    return;
  }
  next();
};

exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;

    const vacante = await Vacante.findById(id);

    console.log('mas antes',vacante);
    if(verificarAutor(vacante, req.user)) {
        //si es el usuario, eliminar
        vacante.deleteOne();
        res.status(200).send('Vacante eliminada correctamente');
    }else{ 
        //No permitir
        res.status(400).send('Error');
    }

}

const verificarAutor = (vacante = {}, usuario = {}) => {
    console.log('el error del autor', vacante);
    if(!vacante.autor.equals(usuario._id)) {
        return false;
    }else {
        return true;
    }
}

//Subir archivos en PDF
exports.subirCV = (req, res, next) => {

    upload(req, res, function(error)  {
        
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande, máximo 200 KB')
                }else {
                    req.flash('error', error.message)
                }
            } 
             else 
             {
              req.flash('error', error.message)  
             }

             res.redirect('back');
             return;
        }else {
            return next();
        }
            
    });
    
}

const configuracionMulter = {
    limits: {fileSize: 200000 },
    storage: fileStorage= multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv')
        },
        filename: (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`)
        }
    }),

    fileFilter: (req, file, cb) => {
        if(file.mimetype === 'application/pdf') {
            //El cb se ejcuta como true o false: true imagen aceptada
            cb(null, true)
        }else {
            cb(new Error('Formato no válido'))
        }
    }
}

const upload = multer(configuracionMulter).single('cv');

exports.contactar = async (req, res, next) => {
    //almacenar los candidatos en la BD
    console.log(req.params.url);
    const vacante = await Vacante.findOne({url: req.params.url});

    //Si no existe la vacante
    if(!vacante) return next();

    //todo bien, construir nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.telefono,
        cv: req.file.filename
    }

    //Almacenar la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    //mensaje flas y redireccion
    req.flash('correcto', 'se envió tu curriculum correctamente');
    res.redirect('/')
}

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id)

    if(vacante.autor != req.user._id.toString()) {
        return next();
    }

    console.log('aqui hay vacantes mijo',vacante);
    if(!vacante) return next();

    res.render('candidatos', {
        nombrePagina: `Candidatos vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}


exports.buscarVacante = async (req, res) => {
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    });

    //mostrar vacantes
    res.render('home', {
        nombrePagina: `Resultados para la busqueda "${req.body.q}"`,
        barra: true,
        vacantes
    })
}