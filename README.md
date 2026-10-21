# Plataforma de Eventos e Inscripciones — API

API REST desarrollada con Express para el proyecto de **Backend II**.

- **Pre-entrega 1:** base arquitectónica: servidor configurable por variables de entorno, separación en capas y estructura inicial para `events` y `sessions`.
- **Pre-entrega 2:** registro seguro de usuarios con validación, normalización de email, hash de contraseña con bcrypt y persistencia en MongoDB.
- **Pre-entrega 3:** autenticación con JWT guardado en una cookie HttpOnly: login, ruta protegida `/current` y logout.

## Temática

Plataforma de **eventos e inscripciones**: los organizadores publican eventos (charlas, talleres, recitales, conferencias) con un cupo limitado y los usuarios se inscriben a ellos. En próximas entregas se incorporarán Passport, roles, autorización, gestión de eventos, inscripciones, control de cupos y notificaciones.

## Tecnologías

- Node.js (módulos ESM)
- Express
- MongoDB + Mongoose (local o MongoDB Atlas)
- bcrypt
- jsonwebtoken
- cookie-parser
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

| Variable             | Obligatoria | Descripción                                          | Ejemplo                                                   |
|----------------------|-------------|------------------------------------------------------|-----------------------------------------------------------|
| `PORT`               | No          | Puerto del servidor (default `8080`)                 | `8080`                                                    |
| `NODE_ENV`           | No          | Entorno. En `production` la cookie se envía con `secure` | `development`                                         |
| `MONGO_URL`          | Sí          | Cadena de conexión a MongoDB (local o Atlas)         | `mongodb+srv://usuario:password@cluster.mongodb.net/plataforma-eventos` |
| `JWT_SECRET`         | Sí          | Secreto con el que se firman los JWT                 | una cadena larga y aleatoria                              |
| `JWT_EXPIRES_IN`     | No          | Expiración del JWT (default `1h`)                    | `1h`, `30m`, `2h`                                         |
| `BCRYPT_SALT_ROUNDS` | No          | Rondas de sal para bcrypt (default `10`)             | `10`                                                      |

Si falta `MONGO_URL` o `JWT_SECRET`, el servidor no arranca y muestra cuál falta. El secreto nunca está escrito en el código.

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
│   ├── server.js                   # valida el entorno, conecta a MongoDB y levanta el servidor
│   ├── config/
│   │   ├── config.js               # variables de entorno
│   │   ├── cookies.js              # nombre y opciones de la cookie de autenticación
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
│   │   └── sessions.service.js     # lógica de registro y login
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
│   │   ├── auth.middleware.js      # verifica el JWT de la cookie
│   │   ├── notFound.middleware.js
│   │   └── errorHandler.middleware.js
│   └── utils/
│       ├── jwt.js                  # firmar y verificar JWT
│       ├── hash.js                 # bcrypt
│       ├── validators.js           # validación y normalización de email
│       └── httpError.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Flujo de capas

```
Ruta → (middleware auth) → Controlador → Servicio → Repositorio → DAO → Modelo (MongoDB)
```

- **Routes**: definen los endpoints y qué middlewares usan.
- **Middlewares**: `auth` protege rutas; también manejo de 404 y errores.
- **Controllers**: manejan `req`/`res`, setean y borran la cookie.
- **Services**: lógica de negocio (validaciones, hash, comparación de contraseña, generación del token).
- **Repositories / DAO**: acceso a datos.
- **DTO**: definen qué datos se exponen en las respuestas.
- **Utils**: helpers reutilizables (`jwt.js`, `hash.js`, `validators.js`).

## Autenticación

1. En el **login**, si el email y la contraseña coinciden, se genera un JWT con el payload `{ id, email, role }` (nunca la contraseña), firmado con `JWT_SECRET` y con la expiración de `JWT_EXPIRES_IN`.
2. El token se guarda en la cookie **`currentUser`** con estas opciones:

   | Opción     | Valor                                   |
   |------------|-----------------------------------------|
   | `httpOnly` | `true` (no se puede leer desde JavaScript del navegador) |
   | `sameSite` | `'lax'`                                 |
   | `maxAge`   | `3600000` (1 hora)                      |
   | `secure`   | `true` solo cuando `NODE_ENV=production` |

3. El middleware **`auth`** lee la cookie, verifica el JWT y guarda el payload en `req.user`. Si no hay cookie, o el token fue manipulado o expiró, responde `401`.
4. El **logout** borra la cookie.

Ante un login fallido, el mensaje es siempre el mismo (`Credenciales inválidas`), sin indicar si el email no existe o si la contraseña es incorrecta.

## Rutas disponibles

| Método | Ruta                     | Descripción                                   | Protegida | Respuestas                    |
|--------|--------------------------|-----------------------------------------------|-----------|-------------------------------|
| GET    | `/api/health`            | Estado del servidor                           | No        | `200`                         |
| GET    | `/api/events`            | Lista de eventos                              | No        | `200`                         |
| POST   | `/api/sessions/register` | Registro de usuario                           | No        | `201` / `400` / `409`         |
| POST   | `/api/sessions/login`    | Login; setea la cookie `currentUser`          | No        | `200` / `400` / `401`         |
| GET    | `/api/sessions/current`  | Datos del usuario autenticado                 | Sí        | `200` / `401`                 |
| POST   | `/api/sessions/logout`   | Cierra la sesión borrando la cookie           | No        | `200`                         |

Cualquier ruta inexistente devuelve `404` con `{ "status": "error", "message": "..." }`.

### GET `/api/health`

**200**
```json
{ "status": "ok", "message": "Servidor activo" }
```

### GET `/api/events`

**200**
```json
{ "status": "success", "payload": [] }
```

### POST `/api/sessions/register`

**Body**

| Campo        | Tipo   | Reglas                                                 |
|--------------|--------|--------------------------------------------------------|
| `first_name` | string | Obligatorio                                            |
| `last_name`  | string | Obligatorio                                            |
| `email`      | string | Obligatorio, formato válido; se guarda en minúsculas y sin espacios |
| `password`   | string | Obligatorio, mínimo 8 caracteres; se guarda hasheada con bcrypt |

El campo `role` no se acepta desde el registro público: si se envía, se ignora y el usuario se crea como `user`.

**Request**
```json
{ "first_name": "Ana", "last_name": "Pérez", "email": "Ana@Mail.com ", "password": "Secreta123" }
```

**201** (email normalizado, sin password)
```json
{ "status": "success", "payload": { "id": "665f2a...", "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "role": "user" } }
```

**400**
```json
{ "status": "error", "message": "Faltan campos obligatorios" }
{ "status": "error", "message": "El formato del email es inválido" }
{ "status": "error", "message": "La contraseña debe tener al menos 8 caracteres" }
```

**409**
```json
{ "status": "error", "message": "El email ya está registrado" }
```

### POST `/api/sessions/login`

**Request**
```json
{ "email": "ana@mail.com", "password": "Secreta123" }
```

**200** (además setea la cookie `currentUser` HttpOnly)
```json
{ "status": "success", "message": "Login correcto" }
```
```
Set-Cookie: currentUser=<jwt>; Max-Age=3600; Path=/; HttpOnly; SameSite=Lax
```

**400** (falta email o password)
```json
{ "status": "error", "message": "Faltan campos obligatorios" }
```

**401** (email inexistente o contraseña incorrecta, mismo mensaje)
```json
{ "status": "error", "message": "Credenciales inválidas" }
```

### GET `/api/sessions/current`

Requiere la cookie `currentUser`, que se envía sola después del login si se usa el mismo cliente (Postman, Thunder Client o el navegador).

**200**
```json
{ "status": "success", "payload": { "id": "665f2a...", "email": "ana@mail.com", "role": "user" } }
```

**401** (sin cookie, token manipulado o expirado)
```json
{ "status": "error", "message": "No autenticado" }
```

### POST `/api/sessions/logout`

**200** (borra la cookie `currentUser`)
```json
{ "status": "success", "message": "Sesión cerrada" }
```

## Cómo probar el flujo completo

Con el servidor corriendo (`npm run dev`) y Postman o Thunder Client:

1. `POST /api/sessions/register` con el body de Ana → `201`.
2. `POST /api/sessions/login` con `{ "email": "ana@mail.com", "password": "Secreta123" }` → `200`. En la pestaña **Cookies** aparece `currentUser`.
3. `GET /api/sessions/current` → `200` con `{ id, email, role }`.
4. `POST /api/sessions/logout` → `200`.
5. `GET /api/sessions/current` otra vez → `401`.

| Caso                                 | Resultado esperado              |
|--------------------------------------|---------------------------------|
| Login con email inexistente          | `401` `Credenciales inválidas`  |
| Login con contraseña incorrecta      | `401` `Credenciales inválidas`  |
| Login sin email o sin password       | `400`                           |
| `/current` sin cookie                | `401` `No autenticado`          |
| `/current` con el token modificado   | `401` `No autenticado`          |
| `/current` con el token expirado     | `401` `No autenticado`          |

Para probar el token modificado: en la pestaña **Cookies** de Thunder Client o Postman, editar el valor de `currentUser` cambiando algunas letras del final. Para probar la expiración: poner `JWT_EXPIRES_IN=10s` en el `.env`, reiniciar, loguearse y esperar 10 segundos.

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

Usuario en MongoDB con la contraseña hasheada

![Usuario en MongoDB](docs/mongo-user.png)

Campos faltantes (400)

![Campos faltantes](docs/campos-faltantes.png)

Contraseña corta (400)

![Contraseña corta](docs/password-corta.png)

Email ya registrado (409)

![Email ya registrado](docs/email-registrado.png)

Intento de registrarse como admin (se crea como user)

![Rol admin ignorado](docs/rol-admin.png)


### Pre-entrega 3

Login correcto con la cookie `currentUser` en la respuesta (HttpOnly, SameSite=Lax)

![Login con cookie](docs/login.png)

GET /current con la cookie (200)

![Current 200](docs/current-200.png)

Logout (borra la cookie)

![Logout](docs/logout.png)

GET /current después del logout, sin cookie (401)

![Current 401](docs/current-401.png)

Login con credenciales inválidas (401, mensaje genérico)

![Credenciales inválidas](docs/login-invalido.png)