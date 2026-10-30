const http = require('http');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const tareaRoutes = require('./routes/tareaRoutes');
const { rutaNoEncontrada, manejarErrores } = require('./middlewares/errores');
const { iniciarNotificaciones } = require('./servicios/notificaciones');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeups_db';
const SESSION_SECRET = process.env.SESSION_SECRET || 'clave_secreta_codeups_2026';
const DOS_HORAS = 1000 * 60 * 60 * 2;

mongoose.set('sanitizeFilter', true);

const app = express();
const servidor = http.createServer(app);

const sesion = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: DOS_HORAS
    }
});

app.use(express.json());
app.use(sesion);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/estado', (req, res) => {
    res.json({ exito: true, mensaje: 'API de CodeUPS funcionando correctamente' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api', rutaNoEncontrada);
app.use(manejarErrores);

iniciarNotificaciones(servidor, sesion);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Conectado a MongoDB exitosamente');
        servidor.listen(PORT, () => {
            console.log(`Servidor de CodeUPS ejecutándose en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error de conexión a MongoDB:', err.message);
        process.exit(1);
    });
