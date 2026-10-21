# Plataforma de Eventos e Inscripciones — API

API REST desarrollada con Express para el proyecto de **Backend II**.

- **Pre-entrega 1:** base arquitectónica: servidor configurable por variables de entorno, separación en capas y estructura inicial para `events` y `sessions`.
- **Pre-entrega 2:** registro seguro de usuarios con validación, normalización de email, hash de contraseña con bcrypt y persistencia en MongoDB.
- **Pre-entrega 3:** autenticación con JWT guardado en una cookie HttpOnly: login, ruta protegida `/current` y logout.
- **Pre-entrega 4:** la autenticación pasa por estrategias de **Passport.js** (`register`, `login`, `current`). Las rutas y sus respuestas no cambian.
- **Pre-entrega 5:** roles (`user`, `organizer`, `admin`), matriz de permisos, middlewares de autenticación y autorización, eventos en MongoDB con control de propiedad y rutas administrativas.
- **Pre-entrega 6:** CRUD completo de eventos con categorías, precio y estados (`draft`, `published`, `cancelled`, `finished`), reglas de negocio en la capa de servicios y listado con filtros, paginación y ordenamiento.

## Temática

Plataforma de **eventos e inscripciones**: los organizadores publican eventos (charlas, talleres, recitales, conferencias) con un cupo limitado y los usuarios se inscriben a ellos. En próximas entregas se incorporarán inscripciones, tickets, control de cupos y notificaciones.

## Tecnologías

- Node.js (módulos ESM)
- Express
- MongoDB + Mongoose (local o MongoDB Atlas)
- bcrypt
- jsonwebtoken
- cookie-parser
- Passport.js (`passport`, `passport-local`, `passport-jwt`)
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
├── docs/                                 # capturas de evidencia
├── scripts/
│   ├── set-role.js                       # asigna un rol a un usuario por email (npm run set-role)
│   └── seed-events.js                    # carga 12 eventos de prueba (npm run seed:events)
├── src/
│   ├── app.js                            # configura Express e inicializa Passport (no levanta el server)
│   ├── server.js                         # valida el entorno, conecta a MongoDB y levanta el servidor
│   ├── config/
│   │   ├── config.js                     # variables de entorno
│   │   ├── cookies.js                    # nombre y opciones de la cookie de autenticación
│   │   ├── db.js                         # conexión a MongoDB
│   │   ├── passport.config.js            # estrategias 'register', 'login' y 'current'
│   │   ├── roles.js                      # roles disponibles: user, organizer, admin
│   │   └── permissions.js                # matriz de permisos: qué roles pueden hacer cada acción
│   ├── routes/
│   │   ├── health.router.js
│   │   ├── events.router.js              # aplica auth + authorize + propiedad en rutas protegidas
│   │   ├── sessions.router.js
│   │   └── users.router.js               # rutas administrativas (solo admin)
│   ├── controllers/
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   ├── sessions.controller.js        # genera el JWT, setea y borra la cookie
│   │   └── users.controller.js
│   ├── services/
│   │   ├── events.service.js             # validación y reglas de negocio de eventos
│   │   └── users.service.js              # listado de usuarios y cambio de rol
│   ├── repositories/
│   │   ├── events.repository.js
│   │   └── users.repository.js
│   ├── dao/
│   │   ├── events.dao.js                 # acceso a MongoDB con Mongoose
│   │   └── users.dao.js
│   ├── dto/
│   │   ├── event.dto.js
│   │   └── user.dto.js                   # datos públicos del usuario (sin password)
│   ├── models/
│   │   ├── User.js
│   │   └── Event.js
│   ├── middlewares/
│   │   ├── auth.middleware.js            # autenticación: valida el JWT de la cookie → 401
│   │   ├── authorize.middleware.js       # autorización: recibe roles permitidos → 403
│   │   ├── eventOwnership.middleware.js  # propiedad: organizer solo sus eventos, admin todos → 403
│   │   ├── passportCall.middleware.js    # ejecuta passport.authenticate(...) y traduce fallos a JSON
│   │   ├── notFound.middleware.js
│   │   └── errorHandler.middleware.js
│   └── utils/
│       ├── jwt.js                        # firmar y verificar JWT
│       ├── hash.js                       # bcrypt
│       ├── validators.js                 # validación y normalización de email
│       ├── eventValidators.js            # validación de campos de eventos
│       ├── eventQuery.js                 # filtros, paginación y orden del listado de eventos
│       └── httpError.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### Flujo de capas

```
Ruta → auth (401) → authorize(roles) (403) → [propiedad (403/404)] → Controlador → Servicio → Repositorio → DAO → Modelo
```

- **Routes**: definen los endpoints y qué middlewares usan. No tienen lógica ni roles escritos a mano: usan `PERMISSIONS`.
- **Middlewares**: autenticación, autorización por rol y propiedad de recursos, reutilizables en cualquier ruta.
- **Estrategias de Passport** (`config/passport.config.js`): registro, login y lectura del JWT.
- **Controllers**: arman la respuesta HTTP; en el login generan el JWT y setean la cookie.
- **Services**: validaciones y reglas de negocio (fecha no pasada, transiciones de estado, no modificar un evento cancelado).
- **Repositories / DAO**: acceso a datos.
- **DTO**: definen qué datos se exponen (nunca la contraseña).

## Autenticación con Passport

Passport se inicializa en `app.js` con `app.use(initializePassport())`. Todas las estrategias se definen y registran en `src/config/passport.config.js`; `app.js` no contiene lógica de autenticación. Se trabaja sin sesiones de servidor (`session: false`): el estado vive en el JWT de la cookie.

### Estrategias implementadas

| Estrategia | Tipo                        | Usada en                       | Qué hace |
|------------|-----------------------------|--------------------------------|----------|
| `register` | `passport-local`            | `POST /api/sessions/register`  | Valida campos obligatorios, formato de email y largo de contraseña; normaliza el email (trim + minúsculas); rechaza emails duplicados; hashea la contraseña con bcrypt y crea el usuario siempre con rol `user` (ignora `role` del body). |
| `login`    | `passport-local`            | `POST /api/sessions/login`     | Valida que lleguen email y contraseña, busca el usuario y compara la contraseña con bcrypt. Ante cualquier fallo responde el mensaje genérico `Credenciales inválidas`. |
| `current`  | `passport-jwt`              | `GET /api/sessions/current`    | Lee el JWT de la cookie `currentUser`, verifica firma y expiración con `JWT_SECRET` y deja `{ id, email, role }` en `req.user`. Sin token válido responde `401`. |

El **logout** no pasa por Passport: solo borra la cookie.

### Quién genera el JWT

Las estrategias solo autentican. Tras un login exitoso, el **controller** (`sessions.controller.js`) genera el JWT con `utils/jwt.js` (payload `{ id, email, role }`, nunca la contraseña, firmado con `JWT_SECRET` y con la expiración de `JWT_EXPIRES_IN`) y lo guarda en la cookie **`currentUser`**:

| Opción     | Valor                                   |
|------------|-----------------------------------------|
| `httpOnly` | `true` (no se puede leer desde JavaScript del navegador) |
| `sameSite` | `'lax'`                                 |
| `maxAge`   | `3600000` (1 hora)                      |
| `secure`   | `true` solo cuando `NODE_ENV=production` |

### Cómo se conectan las rutas con Passport

Las rutas usan el middleware `passportCall(nombre)`, que ejecuta `passport.authenticate(nombre, { session: false }, callback)` y convierte cualquier fallo de la estrategia en una respuesta JSON con el código correcto (`400`, `401` o `409`):

```js
router.post('/register', passportCall('register'), register);
router.post('/login', passportCall('login'), login);
router.get('/current', auth, current); // auth = passportCall('current')
router.post('/logout', logout);
```

### Preparado para providers externos

El sistema queda preparado para sumar estrategias como **Google** o **GitHub** sin tocar `app.js`. En `passport.config.js` las estrategias se registran desde un único objeto:

```js
const strategies = {
  register: registerStrategy,
  login: loginStrategy,
  current: currentStrategy
};
```

Para agregar un provider externo alcanza con instalar su paquete (por ejemplo `passport-github2`), crear la estrategia en ese archivo, agregarla al objeto `strategies` y usarla en una ruta con `passportCall('github')`. Las credenciales del provider (client ID, client secret, callback URL) irían en el `.env`.

## Roles y autorización

### Roles

| Rol         | Quién es                                   | Cómo se obtiene |
|-------------|--------------------------------------------|-----------------|
| `user`      | Asistente: consulta eventos                | Por defecto al registrarse |
| `organizer` | Organizador: crea y gestiona sus eventos   | Lo asigna un `admin` |
| `admin`     | Administrador de la plataforma             | Con el script `npm run set-role` |

El registro público **siempre** crea usuarios con rol `user`: si el body trae `"role": "admin"` o `"role": "organizer"`, se ignora. El modelo `User` solo acepta `user`, `organizer` o `admin`, con `user` por defecto.

### Matriz de permisos

| Acción                              | user | organizer | admin | Ruta |
|-------------------------------------|:----:|:---------:|:-----:|------|
| Consultar eventos publicados        | ✅   | ✅        | ✅    | `GET /api/events`, `GET /api/events/:id` (públicas) |
| Crear eventos                       | ❌   | ✅        | ✅    | `POST /api/events` |
| Modificar / cancelar eventos propios| ❌   | ✅        | ✅    | `PUT /api/events/:id`, `PATCH /api/events/:id/status` |
| Modificar cualquier evento          | ❌   | ❌        | ✅    | `PUT /api/events/:id`, `PATCH /api/events/:id/status` |
| Ver todos los usuarios              | ❌   | ❌        | ✅    | `GET /api/users` |
| Cambiar el rol de un usuario        | ❌   | ❌        | ✅    | `PATCH /api/users/:uid/role` |

La matriz está definida en código en `src/config/permissions.js`, así que hay una sola fuente de verdad:

```js
export const PERMISSIONS = Object.freeze({
  CREATE_EVENT: [ORGANIZER, ADMIN],
  MANAGE_OWN_EVENT: [ORGANIZER, ADMIN],
  MANAGE_ANY_EVENT: [ADMIN],
  VIEW_USERS: [ADMIN],
  CHANGE_USER_ROLE: [ADMIN]
});
```

### Middlewares

| Middleware | Archivo | Qué hace | Error |
|------------|---------|----------|-------|
| `auth` | `middlewares/auth.middleware.js` | Lee el JWT de la cookie `currentUser` (estrategia `current` de Passport), lo valida y busca al usuario en la base para poblar `req.user` con `{ id, email, role }` actualizados. | `401` si no hay sesión válida |
| `authorize(...roles)` | `middlewares/authorize.middleware.js` | Recibe los roles permitidos como parámetro y los compara con `req.user.role`. | `403` si el rol no está permitido |
| `checkEventOwnership` | `middlewares/eventOwnership.middleware.js` | Busca el evento y verifica que el usuario sea su organizador, salvo que su rol tenga `MANAGE_ANY_EVENT` (admin). | `404` si el evento no existe, `403` si no es propio |

Se combinan en las rutas sin repetir lógica:

```js
router.post('/', auth, authorize(PERMISSIONS.CREATE_EVENT), createEvent);
router.put('/:id', auth, authorize(PERMISSIONS.MANAGE_OWN_EVENT), checkEventOwnership, updateEvent);
router.get('/', auth, authorize(PERMISSIONS.VIEW_USERS), getUsers); // users.router.js
```

Como `auth` lee el rol desde la base en cada request, un cambio de rol aplica de inmediato, sin tener que volver a loguearse.

### Diferencia entre 401 y 403

| Código | Significado | Cuándo | Mensaje |
|--------|-------------|--------|---------|
| `401 Unauthorized` | **No autenticado**: la API no sabe quién sos | No hay cookie, el token fue manipulado, expiró o el usuario ya no existe | `No autenticado` |
| `403 Forbidden` | **Sin permiso**: la API sabe quién sos, pero tu rol no puede hacer eso | `user` intenta crear un evento; `organizer` entra a una ruta de admin; `organizer` modifica un evento ajeno | `No tenés permisos para realizar esta acción` / `Solo podés modificar eventos que organizás` |

Estos casos nunca responden `500`.

### Cómo crear un organizer o un admin

Como el registro público solo crea `user`, el primer `admin` se asigna con un script que usa el `MONGO_URL` del `.env`:

```bash
npm run set-role -- admin@mail.com admin
```

A partir de ahí, ese admin puede cambiar el rol de cualquier otro usuario desde la API con `PATCH /api/users/:uid/role`. El script también sirve para cualquier rol: `npm run set-role -- org@mail.com organizer`.

## Eventos

El evento es la entidad central de la plataforma. Cada evento pertenece a un organizador (`organizer`), que se guarda como **referencia** (`ObjectId`) al `User` que lo creó, no como objeto embebido.

### Modelo `Event`

| Campo         | Tipo      | Reglas |
|---------------|-----------|--------|
| `title`       | string    | Obligatorio |
| `description` | string    | Obligatorio |
| `category`    | string    | Obligatorio; se guarda en minúsculas (`Workshop` → `workshop`) |
| `date`        | Date      | Obligatorio; no puede ser pasada |
| `location`    | string    | Obligatorio |
| `capacity`    | number    | Obligatorio; entero mayor a 0 |
| `price`       | number    | Mayor o igual a 0 (default `0` = gratuito) |
| `status`      | string    | `draft` · `published` · `cancelled` · `finished` (default `published`) |
| `organizer`   | ObjectId  | Referencia a `User`; se asigna desde `req.user`, nunca desde el body |

### Endpoints

| Método | Ruta                      | Acceso                         | Descripción |
|--------|---------------------------|--------------------------------|-------------|
| POST   | `/api/events`             | `organizer`, `admin`           | Crear evento |
| GET    | `/api/events`             | Público                        | Listado con filtros, paginación y orden |
| GET    | `/api/events/:id`         | Público                        | Detalle de un evento |
| PUT    | `/api/events/:id`         | Dueño del evento o `admin`     | Modificar datos del evento |
| PATCH  | `/api/events/:id/status`  | Dueño del evento o `admin`     | Cambiar el estado (publicar, cancelar, finalizar) |

Los eventos **nunca se eliminan físicamente**: cancelar es cambiar el `status` a `cancelled`.

### Reglas de negocio

Todas viven en `src/services/events.service.js`; las rutas y los controllers no validan nada.

| Regla | Error |
|-------|-------|
| `title`, `description`, `category`, `date`, `location` y `capacity` son obligatorios | `400` |
| No se puede crear ni mover un evento a una **fecha pasada** | `400` `La fecha del evento no puede ser pasada` |
| `capacity` debe ser un entero mayor a 0 | `400` |
| `price` debe ser mayor o igual a 0 | `400` |
| El `organizer` se toma de la sesión; si viene en el body se ignora | — |
| Un evento nuevo solo puede crearse como `draft` o `published` | `400` |
| Un `organizer` solo modifica eventos propios; `admin` modifica cualquiera | `403` |
| Un evento `cancelled` o `finished` **no se puede modificar** ni cambiar de estado | `400` |
| No se puede **publicar** un evento finalizado, cancelado o con fecha pasada | `400` |
| Los cambios de estado siguen las transiciones permitidas (tabla abajo) | `400` |

**Transiciones de estado permitidas** (`PATCH /api/events/:id/status`):

| Desde       | Hacia |
|-------------|-------|
| `draft`     | `published`, `cancelled` |
| `published` | `draft`, `cancelled`, `finished` |
| `cancelled` | — (estado final) |
| `finished`  | — (estado final) |

**Por qué un evento cancelado no se puede modificar:** cancelar es una decisión definitiva que ya fue comunicada; permitir editarlo o reactivarlo podría confundir a quienes se iban a inscribir. Si el organizador quiere volver a hacerlo, crea un evento nuevo. Lo mismo aplica a los eventos `finished`, que ya ocurrieron.

### Listado: filtros, paginación y orden

`GET /api/events` es público y **siempre está paginado**. Por defecto muestra solo eventos `published`; los `draft` nunca aparecen en el listado público.

| Parámetro  | Ejemplo                    | Descripción |
|------------|----------------------------|-------------|
| `status`   | `status=published`         | `published` (default), `cancelled` o `finished` |
| `category` | `category=workshop`        | Coincidencia exacta (sin distinguir mayúsculas) |
| `location` | `location=córdoba`         | Coincidencia parcial (sin distinguir mayúsculas) |
| `dateFrom` | `dateFrom=2026-11-01`      | Eventos desde esa fecha |
| `dateTo`   | `dateTo=2026-12-31`        | Eventos hasta esa fecha (incluye todo ese día) |
| `page`     | `page=2`                   | Número de página (default `1`) |
| `limit`    | `limit=5`                  | Eventos por página (default `10`, máximo `50`) |
| `sort`     | `sort=date` / `sort=-price`| Campo de orden: `date` (default), `price`, `title`, `capacity`, `createdAt`. Con `-` adelante, orden descendente |

Parámetros inválidos (por ejemplo `page=0`, `limit=500`, `sort=organizer`, una fecha mal escrita o `dateFrom` posterior a `dateTo`) responden `400` con un mensaje que explica el error.

**Ejemplo:** `GET /api/events?status=published&category=workshop&page=2&limit=5`

**200**
```json
{
  "status": "success",
  "data": [
    { "id": "6690...", "title": "Workshop de prueba #8", "description": "...", "category": "workshop", "date": "2027-01-05T18:00:00.000Z", "location": "Mendoza", "capacity": 55, "price": 7000, "status": "published", "organizer": "665f2a..." }
  ],
  "page": 2,
  "limit": 5,
  "total": 8,
  "totalPages": 2
}
```

### GET `/api/events/:id`

**200** con el evento en `payload` · **404** `{ "status": "error", "message": "Evento no encontrado" }` (también si el id no tiene formato válido).

### POST `/api/events`

**Request**
```json
{
  "title": "Workshop de Node",
  "description": "Introducción a Express y MongoDB",
  "category": "workshop",
  "date": "2026-12-10T18:00:00Z",
  "location": "Buenos Aires",
  "capacity": 30,
  "price": 5000
}
```

Opcional: `"status": "draft"` para crearlo como borrador.

**201**
```json
{ "status": "success", "payload": { "id": "6690...", "title": "Workshop de Node", "description": "Introducción a Express y MongoDB", "category": "workshop", "date": "2026-12-10T18:00:00.000Z", "location": "Buenos Aires", "capacity": 30, "price": 5000, "status": "published", "organizer": "665f2a..." } }
```

**400** (fecha pasada)
```json
{ "status": "error", "message": "La fecha del evento no puede ser pasada" }
```

**400** (`capacity: 0`)
```json
{ "status": "error", "message": "El cupo (capacity) debe ser un número entero mayor a 0" }
```

**401** sin sesión · **403** con rol `user`.

### PUT `/api/events/:id`

Acepta cualquier subconjunto de `title`, `description`, `category`, `date`, `location`, `capacity`, `price`. El `status` y el `organizer` no se cambian por acá.

**Request**
```json
{ "capacity": 50, "price": 0 }
```

**200** con el evento actualizado · **400** si los datos son inválidos o el evento está cancelado/finalizado · **403** si es un evento ajeno (`Solo podés modificar eventos que organizás`) · **404** si no existe.

### PATCH `/api/events/:id/status`

**Request**
```json
{ "status": "cancelled" }
```

**200**
```json
{ "status": "success", "payload": { "id": "6690...", "title": "Workshop de Node", "status": "cancelled" } }
```

**400** (cambiar el estado de un evento cancelado)
```json
{ "status": "error", "message": "El evento está cancelado y no se puede modificar" }
```

## Rutas disponibles

| Método | Ruta                          | Descripción                                   | Acceso                          | Respuestas |
|--------|-------------------------------|-----------------------------------------------|---------------------------------|------------|
| GET    | `/api/health`                 | Estado del servidor                           | Público                         | `200` |
| GET    | `/api/events`                 | Eventos con filtros y paginación              | Público                         | `200` |
| GET    | `/api/events/:id`             | Detalle de un evento                          | Público                         | `200` / `404` |
| POST   | `/api/events`                 | Crear evento                                  | `organizer`, `admin`            | `201` / `400` / `401` / `403` |
| PUT    | `/api/events/:id`             | Modificar evento                              | Dueño (`organizer`) o `admin`   | `200` / `400` / `401` / `403` / `404` |
| PATCH  | `/api/events/:id/status`      | Cambiar estado (publicar, cancelar, finalizar)| Dueño (`organizer`) o `admin`   | `200` / `400` / `401` / `403` / `404` |
| GET    | `/api/users`                  | Listar usuarios (ruta administrativa)         | `admin`                         | `200` / `401` / `403` |
| PATCH  | `/api/users/:uid/role`        | Cambiar el rol de un usuario                  | `admin`                         | `200` / `400` / `401` / `403` / `404` |
| POST   | `/api/sessions/register`      | Registro de usuario (siempre rol `user`)      | Público                         | `201` / `400` / `409` |
| POST   | `/api/sessions/login`         | Login; setea la cookie `currentUser`          | Público                         | `200` / `400` / `401` |
| GET    | `/api/sessions/current`       | Datos del usuario autenticado                 | Autenticado                     | `200` / `401` |
| POST   | `/api/sessions/logout`        | Cierra la sesión borrando la cookie           | Público                         | `200` |

Cualquier ruta inexistente devuelve `404` con `{ "status": "error", "message": "..." }`.

### GET `/api/health`

**200**
```json
{ "status": "ok", "message": "Servidor activo" }
```

### Rutas de eventos

Documentadas en detalle en la sección [Eventos](#eventos): filtros, paginación, reglas de negocio y ejemplos de request/response.

### GET `/api/users` (administrativa)

Solo `admin`. Nunca incluye contraseñas.

**200**
```json
{ "status": "success", "payload": [ { "id": "665f2a...", "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "role": "user" } ] }
```

**403** con rol `user` u `organizer` · **401** sin sesión.

### PATCH `/api/users/:uid/role` (administrativa)

Solo `admin`. Un admin no puede cambiar su propio rol.

**Request**
```json
{ "role": "organizer" }
```

**200** con el usuario actualizado · **400** si el rol no es `user`, `organizer` o `admin` · **404** si el usuario no existe.

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

## Cómo probar

### Flujo de sesión

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

### Roles y autorización

Preparación: registrar tres usuarios (`user@mail.com`, `org@mail.com`, `admin@mail.com`) y asignar roles:

```bash
npm run set-role -- admin@mail.com admin
npm run set-role -- org@mail.com organizer
```

| Caso                                                  | Resultado esperado |
|-------------------------------------------------------|--------------------|
| `POST /api/events` logueado como `user`               | `403` |
| `POST /api/events` logueado como `organizer`          | `201` |
| `GET /api/users` logueado como `organizer`            | `403` |
| `GET /api/users` logueado como `admin`                | `200` |
| `POST /api/events` o `GET /api/users` sin cookie      | `401` |
| `PUT /api/events/:id` de otro organizer               | `403` `Solo podés modificar eventos que organizás` |
| `PUT /api/events/:id` de otro organizer, como `admin` | `200` |

Para cambiar de usuario en Thunder Client o Postman, hacer `logout` y luego `login` con el otro email.

### Eventos

Preparación (además de los roles de arriba): cargar 12 eventos de prueba para un organizer, así hay suficientes para probar la paginación:

```bash
npm run seed:events -- org@mail.com
```

| Caso                                                                 | Resultado esperado |
|----------------------------------------------------------------------|--------------------|
| Crear evento con rol `user`                                          | `403` |
| Crear evento con fecha pasada                                        | `400` |
| Crear evento con `capacity: 0`                                       | `400` |
| `organizer` modifica un evento propio                                | `200` |
| `organizer` modifica un evento ajeno                                 | `403` |
| `admin` modifica el evento de otro organizador                       | `200` |
| `PATCH /status` de un evento ya cancelado                            | `400` |
| `GET /api/events?status=published&category=workshop&page=2&limit=5` | `200` con `data`, `page`, `limit`, `total`, `totalPages` |
| `GET /api/events/<id inexistente>`                                   | `404` |

## Modelos

**User**: `first_name`, `last_name`, `email` (único, en minúsculas), `password` (hash bcrypt), `role` (`user` | `organizer` | `admin`, por defecto `user`).

**Event**: `title`, `description`, `category`, `date`, `location`, `capacity`, `price`, `status` (`draft` | `published` | `cancelled` | `finished`), `organizer` (referencia a `User`). Detalle en la sección [Eventos](#eventos).

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


### Pre-entrega 4

Mismo flujo, ahora autenticado con las estrategias de Passport (`register`, `login`, `current`). Las respuestas no cambian respecto de la pre-entrega 3.

Registro (estrategia `register`)

![Registro](docs/p4-register.png)

Email duplicado (409)

![Email duplicado](docs/p4-email-duplicado.png)

Login (estrategia `login`; el controller genera el JWT y setea la cookie)

![Login](docs/p4-login.png)

GET /current con la cookie (estrategia `current`)

![Current 200](docs/p4-current-200.png)

Logout

![Logout](docs/p4-logout.png)

GET /current después del logout (401)

![Current 401](docs/p4-current-401.png)

Login con credenciales inválidas (401, mensaje genérico)

![Credenciales inválidas](docs/p4-login-invalido.png)


### Pre-entrega 5

POST /api/events con rol `user` → 403 (autenticado pero sin permiso)

![Crear evento como user](docs/p5-evento-user-403.png)

POST /api/events con rol `organizer` → 201

![Crear evento como organizer](docs/p5-evento-organizer-201.png)

Ruta administrativa GET /api/users con rol `organizer` → 403

![Users como organizer](docs/p5-users-organizer-403.png)

Ruta administrativa GET /api/users con rol `admin` → 200

![Users como admin](docs/p5-users-admin-200.png)

Organizer intentando modificar un evento ajeno → 403

![Evento ajeno](docs/p5-evento-ajeno-403.png)

Ruta privada sin cookie → 401

![Sin cookie](docs/p5-sin-cookie-401.png)

### Pre-entrega 6

Crear evento con rol `user` → 403

![Crear como user](docs/p6-crear-user-403.png)

Crear evento con fecha pasada → 400

![Fecha pasada](docs/p6-fecha-pasada-400.png)

Crear evento con `capacity: 0` → 400

![Capacity 0](docs/p6-capacity-400.png)

Organizer modifica su propio evento → 200

![Evento propio](docs/p6-propio-200.png)

Organizer modifica un evento ajeno → 403

![Evento ajeno](docs/p6-ajeno-403.png)

Admin modifica el evento de otro organizador → 200

![Admin modifica](docs/p6-admin-200.png)

Cambiar el estado de un evento cancelado → 400

![Evento cancelado](docs/p6-cancelado-400.png)

Listado con filtros y paginación: `?status=published&category=workshop&page=2&limit=5`

![Listado con filtros](docs/p6-listado-filtros.png)

Evento inexistente → 404

![Evento inexistente](docs/p6-inexistente-404.png)
