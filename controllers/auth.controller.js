const passport = require("passport");
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');


exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage:'Ambos campos son obligatorios'
});

//Revisar si el usuario esta autenticado
exports.verificaUsuario = (req, res, next) => {
    //Revisar usuario
    if (req.isAuthenticated()) {
        return next(); //estan autenticado
    }else {
        res.redirect('/iniciar-sesion')
    }
}

exports.mostrarPanel = async (req, res) => {

    //Consultar el usuario autenticado
    const vacantes = await Vacante.find({ autor: req.user._id });

    res.render('administracion', {
        nombrePagina: 'Panel de administración',
        tagline: 'Crear y administra tus vacantes desde aquí',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes
    })
}

exports.cerrarSesion = (req, res) => {
    req.logout(function(err){
        if(err) {
            return next(err);
        }
        return res.redirect('/iniciar-sesion');
    });

}

//Reestablecer password
exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password', {
        nombrePagina: 'Reestablece tu password',
        tagline: 'Si ya tienes una cuenta, pero olvidaste tu password, coloca tu email'
    })
}

//Gerar token tabla usuario

exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });
    console.log('este es',usuario);
    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion'); 
    }

    //El usuario existe generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    //guardar el usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    console.log(resetUrl);

    //todo: enviar notofocacion por email

    await enviarEmail.enviar({
        usuario,
        subject: 'Password reset',
        resetUrl,
        archivo: 'reset'
    })

    req.flash('correcto', 'Revisa tu email para las indicaciones')
    res.redirect('iniciar-sesion')
}

//valida si el token es valido, y si existe muestra la vista
exports.reestablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if(!usuario) {
        req.flash('error', 'Formulario ya no es válido, intenta de nuevo');

        return res.redirect('/reestablecer-password');
    }

    //todo bien, mostrar formulario
    res.render('nuevo-password', {
        nombrePagina: 'Nueva contraseña',
        
    })
}

//guardar nuevo pass en BD
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    //NO EXISTE EL USUARIO O EL TOKEN ES INVALIDO
    if(!usuario) {
        req.flash('error', 'Formulario ya no es válido, intenta de nuevo');

        return res.redirect('/reestablecer-password');
    }

    //asignar nuevo pass, limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    //Agregar y eliminar valores del objeto
    await usuario.save();

    req.flash('correcto', 'Contraseña modificada correctamente');
    res.redirect('/iniciar-sesion')
}