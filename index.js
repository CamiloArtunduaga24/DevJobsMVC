const mongoose = require('mongoose');
require('./config/db.js')

const express = require('express');
const router = require('./routes');
const path = require('path');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore= require('connect-mongo')(session);
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const createError = require('http-errors')
const passport = require('./config/passport.js')

require('dotenv').config({path: 'variables.env'});

const app = express();

//Habilitar Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//Validacion de campos con express validators
//app.use(expressValidator());

//Habiliar Handlebars con vista
 app.engine(
     'handlebars',
     exphbs.engine({
         layoutsDir: './views/layouts/',
         defaultLayout: 'layout',
         extname: 'handlebars',
         helpers: require('./helpers/handlebars'),
         runtimeOptions: {
             allowProtoPropertiesByDefault: true,
             allowProtoMethodsByDefault: true,
         },  
     })
 );


app.set('view engine', 'handlebars');

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

 //inicializar passport
 app.use(passport.initialize());
 app.use(passport.session());

//Alerta y flash messages
app.use(flash());

//Crear middleware propio
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});

app.use('/', router()); 

//404 pagina no existente
app.use((req, res, next) => {
    next(createError(404, 'No encontrado'))
})

//Adminisrar errores
app.use((error, req, res) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;

    res.locals.status = status;
    res.status(status);
    res.render('404')
});

//Dejar que heroku asigne el puerto
const host = '0.0.0.0';
const port = process.env.PORT;

app.listen(port, host, () => {
    console.log('El servidor esta funcionando');
})