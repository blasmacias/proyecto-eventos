# Plataforma de Eventos e Inscripciones — API

API REST desarrollada con Express para el proyecto de **Backend II**. Esta primera pre-entrega deja armada la base arquitectónica del proyecto: servidor configurable por variables de entorno, separación en capas y estructura inicial para los recursos `events` y `sessions`.

## Temática

Plataforma de **eventos e inscripciones**: los organizadores publican eventos (charlas, talleres, recitales, conferencias) con un cupo limitado y los usuarios se inscriben a ellos. En próximas entregas se incorporarán registro, login, JWT, cookies, Passport, roles, autorización, gestión de eventos, inscripciones, control de cupos y notificaciones.

## Tecnologías

- Node.js (módulos ESM)
- Express
- Mongoose (modelos base)
- dotenv

## Instalación

```bash
git clone <url-del-repositorio>
cd proyecto-eventos
npm install
```

## Variables de entorno

Copiar el archivo de ejemplo y completar los valores:

```bash
cp .env.example .env
```

| Variable     | Descripción                                   | Ejemplo                                        |
|--------------|-----------------------------------------------|------------------------------------------------|
| `PORT`       | Puerto en el que escucha el servidor          | `8080`                                         |
| `NODE_ENV`   | Entorno de ejecución                          | `development`                                  |
| `MONGO_URL`  | Cadena de conexión a MongoDB                  | `mongodb://localhost:27017/plataforma-eventos` |
| `JWT_SECRET` | Secreto para firmar tokens JWT (próximas entregas) | `cambiar_por_un_secreto_seguro`           |

## Cómo ejecutar

```bash
# producción
npm start

# desarrollo (reinicia al guardar cambios)
npm run dev
```

El servidor queda disponible en `http://localhost:<PORT>`.

## Estructura de carpetas

```
proyecto-eventos/
├── src/
│   ├── app.js                      # configura Express (no levanta el server)
│   ├── server.js                   # levanta el servidor
│   ├── config/
│   │   └── config.js               # carga de variables de entorno
│   ├── routes/
│   │   ├── health.router.js
│   │   ├── events.router.js
│   │   └── sessions.router.js
│   ├── controllers/
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   └── sessions.controller.js
│   ├── services/
│   │   └── events.service.js
│   ├── repositories/
│   │   └── events.repository.js
│   ├── dao/
│   │   └── events.memory.dao.js
│   ├── models/
│   │   ├── User.js
│   │   └── Event.js
│   ├── middlewares/
│   │   ├── notFound.middleware.js
│   │   └── errorHandler.middleware.js
│   └── utils/
│       └── httpError.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Flujo de capas

```
Ruta → Controlador → Servicio → Repositorio → DAO → (persistencia)
```

- **Routes**: definen los endpoints y delegan en el controlador.
- **Controllers**: manejan `req`/`res` y arman la respuesta HTTP.
- **Services**: lógica de negocio.
- **Repositories**: abstraen el acceso a datos para los servicios.
- **DAO**: implementación concreta de la persistencia (por ahora en memoria; luego MongoDB).
- **Models**: esquemas de Mongoose.
- **Middlewares**: manejo de rutas inexistentes y errores.

## Rutas disponibles

| Método | Ruta                    | Descripción                          | Respuesta                                                   |
|--------|-------------------------|--------------------------------------|-------------------------------------------------------------|
| GET    | `/api/health`           | Estado del servidor                  | `200` `{ "status": "ok", "message": "Servidor activo" }`    |
| GET    | `/api/events`           | Lista de eventos                     | `200` `{ "status": "success", "payload": [] }`              |
| POST   | `/api/sessions/register`| Registro de usuario (pendiente)      | `501`                                                       |
| POST   | `/api/sessions/login`   | Login de usuario (pendiente)         | `501`                                                       |
| GET    | `/api/sessions/current` | Usuario autenticado actual (pendiente) | `501`                                                     |

Cualquier ruta inexistente devuelve `404` con `{ "status": "error", "message": "..." }`.

## Modelos

**User**: `first_name`, `last_name`, `email` (único), `password`, `role` (`user` | `organizer` | `admin`).

**Event**: `title`, `description`, `date`, `location`, `capacity`, `organizer` (referencia a `User`).

## Evidencia

GET /api/health

![GET /api/health](docs/health.png)

GET /api/events

![GET /api/events](docs/events.png)