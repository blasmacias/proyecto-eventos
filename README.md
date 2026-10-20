# Plataforma de Eventos e Inscripciones — API

API REST desarrollada con Express para el proyecto de **Backend II**.

- **Pre-entrega 1:** base arquitectónica: servidor configurable por variables de entorno, separación en capas y estructura inicial para `events` y `sessions`.
- **Pre-entrega 2:** registro seguro de usuarios (`POST /api/sessions/register`) con validación, normalización de email, hash de contraseña con bcrypt y persistencia en MongoDB.

## Temática

Plataforma de **eventos e inscripciones**: los organizadores publican eventos (charlas, talleres, recitales, conferencias) con un cupo limitado y los usuarios se inscriben a ellos. En próximas entregas se incorporarán login, JWT, cookies, Passport, roles, autorización, gestión de eventos, inscripciones, control de cupos y notificaciones.

## Tecnologías

- Node.js (módulos ESM)
- Express
- MongoDB + Mongoose
- bcrypt
- dotenv

## Instalación

```bash
git clone https://github.com/blasmacias/proyecto-eventos.git
cd proyecto-eventos
npm install
```

## Variables de entorno

Copiar el archivo de ejemplo y completar los valores:

```bash
cp .env.example .env
```

| Variable             | Descripción                                        | Ejemplo                                                   |
|----------------------|----------------------------------------------------|-----------------------------------------------------------|
| `PORT`               | Puerto en el que escucha el servidor               | `8080`                                                    |
| `NODE_ENV`           | Entorno de ejecución                               | `development`                                             |
| `MONGO_URL`          | Cadena de conexión a MongoDB (local o Atlas)       | `mongodb+srv://usuario:password@cluster.mongodb.net/plataforma-eventos` |
| `JWT_SECRET`         | Secreto para firmar tokens JWT (próximas entregas) | `cambiar_por_un_secreto_seguro`                           |
| `BCRYPT_SALT_ROUNDS` | Rondas de sal para bcrypt (opcional, default 10)   | `10`                                                      |

`MONGO_URL` es obligatoria: si falta o la conexión falla, el servidor no arranca y muestra el motivo en consola.

## Cómo ejecutar

```bash
# producción
npm start

# desarrollo (reinicia al guardar cambios)
npm run dev
```

Al iniciar se ve en consola `Conectado a MongoDB` y luego `Servidor escuchando en el puerto <PORT>`.

## Estructura de carpetas

```
proyecto-eventos/
├── docs/                           # capturas de evidencia
├── src/
│   ├── app.js                      # configura Express (no levanta el server)
│   ├── server.js                   # conecta a MongoDB y levanta el servidor
│   ├── config/
│   │   ├── config.js               # carga de variables de entorno
│   │   └── db.js                   # conexión a MongoDB
│   ├── routes/
│   │   ├── health.router.js
│   │   ├── events.router.js
│   │   └── sessions.router.js
│   ├── controllers/
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   └── sessions.controller.js
│   ├── services/
│   │   ├── events.service.js
│   │   └── sessions.service.js     # validaciones y lógica de registro
│   ├── repositories/
│   │   ├── events.repository.js
│   │   └── users.repository.js
│   ├── dao/
│   │   ├── events.memory.dao.js
│   │   └── users.dao.js            # acceso a MongoDB con Mongoose
│   ├── dto/
│   │   └── user.dto.js             # datos públicos del usuario (sin password)
│   ├── models/
│   │   ├── User.js
│   │   └── Event.js
│   ├── middlewares/
│   │   ├── notFound.middleware.js
│   │   └── errorHandler.middleware.js
│   └── utils/
│       ├── hash.js                 # helper reutilizable de bcrypt
│       ├── validators.js           # validación y normalización de email
│       └── httpError.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Flujo de capas

```
Ruta → Controlador → Servicio → Repositorio → DAO → Modelo (MongoDB)
```

- **Routes**: definen los endpoints y delegan en el controlador.
- **Controllers**: manejan `req`/`res` y arman la respuesta HTTP.
- **Services**: lógica de negocio (validaciones, normalización, hash).
- **Repositories**: abstraen el acceso a datos para los servicios.
- **DAO**: implementación concreta de la persistencia.
- **DTO**: definen qué datos se exponen en las respuestas.
- **Models**: esquemas de Mongoose.
- **Utils**: helpers reutilizables (`hash.js`, `validators.js`).
- **Middlewares**: manejo de rutas inexistentes y errores.

## Rutas disponibles

| Método | Ruta                     | Descripción                            | Respuesta                                                |
|--------|--------------------------|----------------------------------------|----------------------------------------------------------|
| GET    | `/api/health`            | Estado del servidor                    | `200` `{ "status": "ok", "message": "Servidor activo" }` |
| GET    | `/api/events`            | Lista de eventos                       | `200` `{ "status": "success", "payload": [] }`           |
| POST   | `/api/sessions/register` | Registro de usuario                    | `201` / `400` / `409` (ver abajo)                        |
| POST   | `/api/sessions/login`    | Login de usuario (pendiente)           | `501`                                                    |
| GET    | `/api/sessions/current`  | Usuario autenticado actual (pendiente) | `501`                                                    |

Cualquier ruta inexistente devuelve `404` con `{ "status": "error", "message": "..." }`.

## Registro de usuarios — `POST /api/sessions/register`

### Campos que espera (body JSON)

| Campo        | Tipo   | Obligatorio | Reglas                                                  |
|--------------|--------|-------------|---------------------------------------------------------|
| `first_name` | string | Sí          | No puede estar vacío                                    |
| `last_name`  | string | Sí          | No puede estar vacío                                    |
| `email`      | string | Sí          | Formato válido; se guarda en minúsculas y sin espacios  |
| `password`   | string | Sí          | Mínimo 8 caracteres; se guarda hasheada con bcrypt      |

El campo `role` **no se acepta** desde el registro público: si se envía, se ignora y el usuario se crea siempre con rol `user`.

### Respuestas

**201 — usuario creado** (email normalizado, sin password):

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

**400 — datos inválidos:**

```json
{ "status": "error", "message": "Faltan campos obligatorios" }
{ "status": "error", "message": "El formato del email es inválido" }
{ "status": "error", "message": "La contraseña debe tener al menos 8 caracteres" }
```

**409 — email ya registrado:**

```json
{ "status": "error", "message": "El email ya está registrado" }
```

### Cómo probarlo

Con el servidor corriendo (`npm run dev`), usar Postman, Thunder Client (extensión de VS Code) o `curl`:

- **Método:** `POST`
- **URL:** `http://localhost:8080/api/sessions/register`
- **Header:** `Content-Type: application/json`
- **Body (raw JSON):**

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "Ana@Mail.com ",
  "password": "Secreta123"
}
```

Con `curl` (Git Bash):

```bash
curl -X POST http://localhost:8080/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Ana","last_name":"Pérez","email":"Ana@Mail.com ","password":"Secreta123"}'
```

### Casos a verificar

| Caso                    | Body de ejemplo                                              | Resultado esperado |
|-------------------------|--------------------------------------------------------------|--------------------|
| Registro exitoso        | El de arriba                                                 | `201`, sin password, email `ana@mail.com` |
| Campos faltantes        | `{ "first_name": "Ana" }`                                    | `400` |
| Email inválido          | `email: "ana-mail.com"`                                      | `400` |
| Contraseña corta        | `password: "123"`                                            | `400` |
| Email ya registrado     | Repetir el registro exitoso (aunque cambien mayúsculas)      | `409` |
| Intento de rol admin    | Agregar `"role": "admin"` al body                            | `201` con `role: "user"` |
| Contraseña en la base   | Ver el documento en MongoDB Atlas / Compass                  | `password` empieza con `$2b$` |

## Modelos

**User**: `first_name`, `last_name`, `email` (único, en minúsculas), `password` (hash bcrypt), `role` (`user` | `organizer` | `admin`, por defecto `user`).

**Event**: `title`, `description`, `date`, `location`, `capacity`, `organizer` (referencia a `User`).

## Evidencia

### Pre-entrega 1

GET /api/health

![GET /api/health](docs/health.png)

GET /api/events

![GET /api/events](docs/events.png)

### Pre-entrega 2

Registro exitoso (201, sin password y con email normalizado)

![Registro exitoso](docs/register.png)

Campos faltantes (400)

![Campos faltantes](docs/campos-faltantes.png)

Contraseña corta (400)

![Contraseña corta](docs/password-corta.png)

Email ya registrado (409)

![Email ya registrado](docs/email-registrado.png)

Intento de registrarse como admin (se crea como user)

![Rol admin ignorado](docs/rol-admin.png)

   Usuario en MongoDB con la contraseña hasheada

   ![Usuario en MongoDB](docs/mongo-user.png)