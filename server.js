const express = require('express');
const morgan = require('morgan');
const cors = require('cors');


const app = express();


// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


// === "Base de datos" ===
let tareas = [];
let siguienteId = 1; // id autoincremental


// Buscar por id
function buscarTareaPorId(id) {
    console.log('Buscando tarea con ID:', id);
    return tareas.find(t => t.id === id);
}


// Valida y normaliza :id
app.param('id', (req, res, next, id) => {
    const num = Number(id);
    if (!Number.isInteger(num) || num <= 0) {
        return res.status(400).json({ error: 'ID inválido debe ser entero positivo' });
    }
    req.taskId = num;
    next();
});


// =========================
// CRUD de Tareas
// =========================


// Crear tarea
// POST /tareas
app.post('/tareas', (req, res) => {
    const { titulo, descripcion = '', completado = false } = req.body || {};


    if (!titulo || typeof titulo !== 'string' || !titulo.trim()) {
        return res.status(400).json({ error: 'El campo "titulo" es requerido' });
    }
    if (typeof completado !== 'boolean') {
    if (completado !== undefined) {
        return res.status(400).json({ error: 'El campo "completado" debe ser booleano.' });
    }
    }


    const now = new Date().toISOString();
    const tarea = {
        id: siguienteId++,
        titulo: titulo.trim(),
        descripcion,
        completado: Boolean(completado),
        creadoEn: now,
        actualizadoEn: now
    };
    tareas.push(tarea);
    return res.json(tarea);
});

// Leer todas las tareas
// GET /tareas
app.get('/tareas', (req, res) => {
    let resultado = tareas;
    return res.json(resultado);
});



// Leer una tarea por ID
// GET /tareas/:id
app.get('/tareas/:id', (req, res) => {
    const tarea = buscarTareaPorId(req.taskId);
    if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });
    return res.json(tarea);
});


// Actualizar una tarea
// PUT /tareas/:id
app.put('/tareas/:id', (req, res) => {
const tarea = buscarTareaPorId(req.taskId);
if (!tarea) return res.status(404).json({ error: 'Tarea no encontrada' });


const { titulo, descripcion, completado } = req.body || {};


if (titulo !== undefined && (typeof titulo !== 'string' || !titulo.trim())) {
return res.status(400).json({ error: '"titulo" debe ser string no vacío si se envía.' });
}
if (completado !== undefined && typeof completado !== 'boolean') {
return res.status(400).json({ error: '"completado" debe ser boolean si se envía.' });
}


if (titulo !== undefined) tarea.titulo = titulo.trim();
if (descripcion !== undefined) tarea.descripcion = descripcion;
if (completado !== undefined) tarea.completado = completado;
tarea.actualizadoEn = new Date().toISOString();


return res.json(tarea);
});


// Eliminar una tarea
// DELETE /tareas/:id
app.delete('/tareas/:id', (req, res) => {
const indice = tareas.findIndex(t => t.id === req.tareaId);
if (indice === -1) return res.status(404).json({ error: 'Tarea no encontrada' });


const [eliminada] = tareas.splice(indice, 1);
return res.json({ message: 'Tarea eliminada', tarea: eliminada });
});


// GET /stats
app.get('/stats', (req, res) => {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.completado).length;
    const pendientes = total - completadas;
    const masReciente = total
        ? [...tareas].sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))[0]
        : null;
    const masAntigua = total
        ? [...tareas].sort((a, b) => new Date(a.creadoEn) - new Date(b.creadoEn))[0]
        : null;

    return res.json({ total, completadas, pendientes, masReciente, masAntigua });
});

// =========================
// Manejo de errores y 404
// =========================


// 404 para rutas no existentes
app.use((req, res) => {
return res.status(404).json({ error: 'Ruta no encontrada' });
});


// Manejador de errores
app.use((err, req, res, next) => {
console.error(err);
return res.status(500).json({ error: 'Error interno del servidor' });
});


// Arrancar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`🚀 API To-Do ejecutándose en http://localhost:${PORT}`);
});
