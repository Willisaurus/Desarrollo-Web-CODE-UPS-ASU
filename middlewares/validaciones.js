const { body, param } = require('express-validator');
const { AREAS, ESTADOS, DOMINIOS_PERMITIDOS } = require('../config/constantes');

const esCorreoInstitucional = correo =>
    DOMINIOS_PERMITIDOS.some(dominio => correo.endsWith(dominio));

const reglasRegistro = [
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 80 }).withMessage('El nombre no puede superar los 80 caracteres'),
    body('correo').trim().toLowerCase()
        .isEmail().withMessage('Debe ser un correo válido')
        .custom(esCorreoInstitucional)
        .withMessage('Debe ser un correo institucional (@est.ups.edu.ec o @ups.edu.ec)'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('area').isIn(AREAS).withMessage('Área no válida')
];

const reglasLogin = [
    body('correo').trim().toLowerCase().notEmpty().withMessage('Ingrese su correo'),
    body('password').notEmpty().withMessage('Ingrese su contraseña')
];

const reglasTarea = [
    body('titulo').trim().notEmpty().withMessage('El título de la tarea es obligatorio')
        .isLength({ min: 3, max: 100 }).withMessage('El título debe tener entre 3 y 100 caracteres'),
    body('descripcion').optional().trim()
        .isLength({ max: 500 }).withMessage('La descripción no puede superar los 500 caracteres'),
    body('area').isIn(AREAS).withMessage('Área inválida'),
    body('fechaEntrega').isISO8601().withMessage('La fecha de entrega debe tener el formato AAAA-MM-DD'),
    body('estado').optional().isIn(ESTADOS).withMessage('Estado inválido')
];

const reglaId = [
    param('id').isMongoId().withMessage('El id de la tarea no es válido')
];

module.exports = {
    reglasRegistro,
    reglasLogin,
    reglasTarea,
    reglaId
};

