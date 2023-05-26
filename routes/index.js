const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller.js');
const vacantesController = require('../controllers/vacantes.controller.js');
const usuariosController = require('../controllers/usuarios.controller.js');
const authController = require('../controllers/auth.controller.js')


module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    //Crear vacantes
    router.get('/vacantes/nueva', 
    authController.verificaUsuario,
    vacantesController.formularioNuevaVacante);

    router.post('/vacantes/nueva', 
    authController.verificaUsuario,
    vacantesController.validarVacante,
    vacantesController.aregarVacante);

    //Mostrar Vacante
    router.get('/vacantes/:url', vacantesController.mostrarVacante);

    //Editar Vacante
    router.get('/vacantes/editar/:url', 
    authController.verificaUsuario,
    vacantesController.validarVacante,
    vacantesController.formEditarVacante);

    router.post('/vacantes/editar/:url', 
    authController.verificaUsuario,
    vacantesController.editarVacante);

    //Crear cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', 
         usuariosController.validarRegistro,
         usuariosController.crearUsuario);

    //Eliminar vacantes

    router.delete('/vacantes/eliminar/:id',
    vacantesController.eliminarVacante
    )
    
    //Autenticar usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    //Cerrar Sesion
    router.get('/cerrar-sesion', 
    authController.verificaUsuario,
    authController.cerrarSesion);

    //Resetear paswword (emails)
    router.get('/reestablecer-password', authController.formReestablecerPassword);
    router.post('/reestablecer-password', authController.enviarToken);

    //Resetear paswword almacenar en la BD
    router.get('/reestablecer-password/:token', authController.reestablecerPassword);
    router.post('/reestablecer-password/:token', authController.guardarPassword);


    //Panel de administración
    router.get('/administracion', 
    authController.verificaUsuario,
    authController.mostrarPanel);

    //Editar Perfil
    router.get('/editar-perfil',
    authController.verificaUsuario,
    usuariosController.formEditarPerfil);

    router.post('/editar-perfil',
    authController.verificaUsuario,
    // usuariosController.validarPerfil,
    usuariosController.subirImagen,
    usuariosController.editarPerfil)

    //Recibir mensajes de candidatos
    router.post('/vacantes/:url',
    vacantesController.subirCV,
    vacantesController.contactar
    )

    //Muestra los candidatos por vacante
    router.get('/candidatos/:id',
    authController.verificaUsuario,
    vacantesController.mostrarCandidatos
    )

    //Buscador de vacantes
    router.post('/buscador',
    vacantesController.buscarVacante
    )


    return router;
}