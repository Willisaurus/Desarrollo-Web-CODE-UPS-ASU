const http = require('http');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const tareaRoutes = require('./routes/tareaRoutes');
const { rutaNoEncontrada, manejarErrores } = require('./middlewares/errores');
const { iniciarNotificaciones } = require('./servicios/notificaciones');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeups_db';
const SESSION_SECRET = process.env.SESSION_SECRET || 'clave_secreta_codeups_2026';
const DOS_HORAS = 1000 * 60 * 60 * 2;
const EN_PRODUCCION = process.env.NODE_ENV === 'production';

mongoose.set('sanitizeFilter', true);

const app = express();
const servidor = http.createServer(app);

const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
};

app.set('trust proxy', 1);

const sesion = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: EN_PRODUCCION,
        sameSite: EN_PRODUCCION ? 'none' : 'lax',
        maxAge: DOS_HORAS
    }
});

app.use(cors(corsOptions));
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

iniciarNotificaciones(servidor, sesion, corsOptions);

async function iniciarServidor(uri = MONGO_URI, puerto = PORT) {
    await mongoose.connect(uri);
    return new Promise(resolver => {
        servidor.listen(puerto, () => {
            resolver(servidor);
        });
    });
}

if (require.main === module) {
    iniciarServidor()
        .then(() => {
            console.log('Conectado a MongoDB exitosamente');
            console.log(`Servidor de CodeUPS ejecutándose en http://localhost:${PORT}`);
        })
        .catch(err => {
            console.error('Error de conexión a MongoDB:', err.message);
            process.exit(1);
        });
}

module.exports = { app, servidor, iniciarServidor };
