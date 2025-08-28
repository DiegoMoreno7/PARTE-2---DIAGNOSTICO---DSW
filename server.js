const express = require('express');
const morgan = require('morgan');
const cors = require('cors');


const app = express();


// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


// === "Base de datos" ===
let tasks = [];
let nextId = 1; // id autoincremental


// Buscar por id
function findTaskById(id) {
    return tasks.find(t => t.id === id);
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
// POST /tasks
app.post('/tasks', (req, res) => {
    const { title, description = '', completed = false } = req.body || {};


    if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'El campo "title" es requerido' });
    }
    if (typeof completed !== 'boolean') {
    if (completed !== undefined) {
        return res.status(400).json({ error: 'El campo "completed" debe ser booleano.' });
    }
    }


    const now = new Date().toISOString();
    const task = {
        id: nextId++,
        title: title.trim(),
        description,
        completed: Boolean(completed),
        createdAt: now,
        updatedAt: now
    };
    tasks.push(task);
    return res.json(task);
});

// Leer todas las tareas
// GET /tasks
app.get('/tasks', (req, res) => {
    let result = tasks;
    return res.json(result);
});



// Leer una tarea por ID
// GET /tasks/:id
app.get('/tasks/:id', (req, res) => {
    const task = findTaskById(req.taskId);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    return res.json(task);
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