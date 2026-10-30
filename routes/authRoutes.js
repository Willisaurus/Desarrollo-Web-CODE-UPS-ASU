const express = require('express');
const { reglasRegistro, reglasLogin } = require('../middlewares/validaciones');
const { validarCampos, verificarSesion } = require('../middlewares/seguridad');
const {
    registrar,
    iniciarSesion,
    obtenerPerfil,
    cerrarSesion
} = require('../controllers/authController');

const router = express.Router();

router.post('/registro', reglasRegistro, validarCampos, registrar);
router.post('/login', reglasLogin, validarCampos, iniciarSesion);
router.get('/perfil', verificarSesion, obtenerPerfil);
router.post('/logout', verificarSesion, cerrarSesion);

module.exports = router;
