const express = require('express');
const { reglasTarea, reglaId } = require('../middlewares/validaciones');
const { validarCampos, verificarSesion, verificarPropietario } = require('../middlewares/seguridad');
const {
    listarTareas,
    obtenerTarea,
    crearTarea,
    actualizarTarea,
    eliminarTarea
} = require('../controllers/tareaController');

const router = express.Router();

router.use(verificarSesion);

router.get('/', listarTareas);
router.get('/:id', reglaId, validarCampos, obtenerTarea);
router.post('/', reglasTarea, validarCampos, crearTarea);
router.put('/:id', reglaId, reglasTarea, validarCampos, verificarPropietario, actualizarTarea);
router.delete('/:id', reglaId, validarCampos, verificarPropietario, eliminarTarea);

module.exports = router;
