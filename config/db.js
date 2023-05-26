const moongose = require('mongoose');
require('dotenv').config({path: 'variables.env'});


moongose.connect(process.env.DATABASE, {useNewUrlParser: true});

moongose.connection.on('error', (error) => {
    console.log(error);
})

//Importar los modelos
require('../models/usuarios.js')
require('../models/vacantes.js')