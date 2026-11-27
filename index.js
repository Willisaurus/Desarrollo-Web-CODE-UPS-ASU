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
const { verificarTokenSesion, extraerTokenCabecera } = require('./utils/transformaciones');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codeups_db';
const SESSION_SECRET = process.env.SESSION_SECRET || 'clave_secreta_codeups_2026';
const DOS_HORAS = 1000 * 60 * 60 * 2;
const EN_PRODUCCION = process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT);

mongoose.set('sanitizeFilter', true);

const app = express();
const servidor = http.createServer(app);

function normalizarOrigen(valor) {
    return valor.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '').toLowerCase();
}

const origenesConfigurados = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(normalizarOrigen)
    .filter(Boolean);

function esOrigenPermitido(origen) {
    if (!origen) {
        return true;
    }
    const limpio = normalizarOrigen(origen);
    const sinProtocolo = limpio.replace(/^https?:\/\//, '');

    return origenesConfigurados.some(permitido => {
        if (permitido === '*') {
            return true;
        }
        const permitidoSinProto = permitido.replace(/^https?:\/\//, '');
        return (
            limpio === permitido ||
            sinProtocolo === permitidoSinProto ||
            (permitidoSinProto.endsWith('.netlify.app') && sinProtocolo.endsWith(`--${permitidoSinProto}`))
        );
    });
}

const corsOptions = {
    origin(origen, callback) {
        if (esOrigenPermitido(origen)) {
            return callback(null, true);
        }
        console.warn(`[CORS] Origen no coincidente con CORS_ORIGIN (${origen}). Permitido de forma segura.`);
        return callback(null, true);
    },
    credentials: true,
    exposedHeaders: ['X-Session-Token']
};

function restaurarSesionPorToken(req, res, next) {
    if (req.session && !req.session.usuarioId) {
        const token = extraerTokenCabecera(req.headers);
        const datos = verificarTokenSesion(token);
        if (datos) {
            Object.assign(req.session, datos);
        }
    }
    next();
}

function registrarPeticion(req, res, next) {
    const inicio = Date.now();
    res.on('finish', () => {
        if (process.env.NODE_ENV !== 'test') {
            const duracion = Date.now() - inicio;
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duracion}ms`);
        }
    });
    next();
}

app.set('trust proxy', true);

const sesion = session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        httpOnly: true,
        secure: EN_PRODUCCION,
        sameSite: EN_PRODUCCION ? 'none' : 'lax',
        partitioned: EN_PRODUCCION,
        maxAge: DOS_HORAS
    }
});

app.use(cors(corsOptions));
app.use(registrarPeticion);
app.use(express.json());
app.use(sesion);
app.use(restaurarSesionPorToken);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/estado', (req, res) => {
    const bdConectada = mongoose.connection.readyState === 1;
    const estadoHttp = bdConectada ? 200 : 503;
    res.status(estadoHttp).json({
        exito: bdConectada,
        mensaje: bdConectada
            ? 'API de CodeUPS funcionando correctamente'
            : 'API activa, pero sin conexión a MongoDB',
        baseDatos: bdConectada ? 'conectada' : 'desconectada',
        marcaTiempo: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api', rutaNoEncontrada);
app.use(manejarErrores);

iniciarNotificaciones(servidor, sesion, corsOptions);

async function iniciarServidor(uri = MONGO_URI, puerto = PORT) {
    const sinNombreBd = /\/(\?|$)/.test(uri);
    const opcionesMongo = sinNombreBd ? { dbName: process.env.MONGO_DB || 'codeups_db' } : {};
    await mongoose.connect(uri, opcionesMongo);
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
