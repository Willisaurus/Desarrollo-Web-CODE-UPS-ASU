Estudiante: Wilson Mateo Siguencia Illescas
Asignatura: Aplicaciones Web

API hecha con Node.js, Express y MongoDB para que los estudiantes de CodeUPS se registren, inicien sesión y gestionen tareas y eventos.

Estructura

index.js             -> arranca Express y se conecta a MongoDB
config/constantes.js -> áreas y estados permitidos
models/              -> esquemas de Mongoose (Estudiante, Tarea)
routes/              -> endpoints de autenticación y de tareas
middlewares/         -> validación, sesión y formato de errores
public/              -> página web (HTML, CSS, JS, imágenes)

Cómo ejecutar

1. Tener MongoDB Community Server en ejecución (`mongodb://127.0.0.1:27017`).
2. `npm install`
3. `npm start` y abrir http://localhost:3000

Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/registro | Registrar estudiante |
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/auth/perfil | Ver la sesión activa |
| POST | /api/auth/logout | Cerrar sesión |
| GET | /api/tareas | Listar tareas |
| GET | /api/tareas/:id | Ver una tarea |
| POST | /api/tareas | Crear tarea |
| PUT | /api/tareas/:id | Actualizar tarea (solo su creador) |
| DELETE | /api/tareas/:id | Eliminar tarea (solo su creador) |

