const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Endpoint de prueba de la API
app.get('/api/estado', (req, res) => {
    res.json({ mensaje: "API de CodeUPS funcionando correctamente" });
});

// Levantar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor de CodeUPS ejecutándose en http://localhost:${PORT}`);
});