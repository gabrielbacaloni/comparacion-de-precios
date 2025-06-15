# 🕹️ GGPRICE - Comparador de Precios de Videojuegos

GGPRICE es una aplicación web que te permite comparar precios de videojuegos en distintas tiendas, consultar información detallada desde la API de RAWG, gestionar favoritos y perfiles de usuario con almacenamiento en Firebase y Cloudinary.

---

## 🚀 Requisitos previos

Asegurate de tener lo siguiente instalado/configurado en tu entorno local:

- ✅ [Node.js](https://nodejs.org/) (versión 16+)
- ✅ Servidor MySQL (XAMPP/WAMP/AppServ)
- ✅ Cuenta en [Firebase](https://console.firebase.google.com/)
- ✅ Cuenta en [Cloudinary](https://cloudinary.com/)
- ✅ API Key de [RAWG API](https://rawg.io/apidocs)
- ✅ Extensión "Live Server" en Visual Studio Code

---

## ⚙️ Configuración inicial

### 🔐 1. Configurar variables de entorno

1. Renombrá el archivo:
   ```bash
   mv .envEjemplo .env
   ```

2. Completá los valores reales en `.env`:

```env
# Base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=bd_ggprice

# Cloudinary
CLOUDINARY_NAME=tu_nombre_cloudinary
CLOUDINARY_KEY=tu_api_key_cloudinary
CLOUDINARY_SECRET=tu_api_secret_cloudinary

# RAWG
RAWG_API_KEY=tu_api_key_rawg

# Servidor
PORT=3000

# Nodemailer
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASS=tu_contraseña_app_gmail
```

---

### 🔥 2. Configurar Firebase

#### 2.1 Crear `serviceAccountKey.json`

1. En Firebase Console, seleccioná tu proyecto.
2. Navegá a **Configuración** > **Cuentas de servicio**.
3. En "Admin SDK", hacé clic en "Generar nueva clave privada".
4. Guardá el archivo y colocálo en:

```bash
comparacion-de-precios/docs/backend/serviceAccountKey.json
```

#### 2.2 Crear colección `usuarios`

En Firestore Database:

- Colección: `usuarios`
- Documento: Auto-ID
- Campos:
  - `nickname` (string)
  - `mail` (string)
  - `password` (string, hasheado automáticamente)
  - `img_perfil` (string, opcional)

---

### 🗃️ 3. Configurar MySQL

1. Iniciá tu servidor (XAMPP/WAMP).
2. Ingresá a `http://localhost/phpmyadmin`.
3. Creá una base de datos `bd_ggprice` con cotejamiento `utf8mb4_unicode_ci`.
4. Importá el archivo:
   ```
   SQL/bd_ggprice.sql
   ```

---

## 🛠️ Instalación y ejecución

### 📦 1. Instalar dependencias

```bash
cd comparacion-de-precios/docs/backend/
npm install
```

### ▶ 2. Iniciar backend

```bash
node app.js
```

En la terminal deberías ver:
```
Servidor GGPRICE escuchando en http://localhost:3000
```

### 🌐 3. Ejecutar frontend

> ℹ️ **IMPORTANTE:** para evitar conflictos de puerto, configurá Live Server para usar el puerto `5500`, así no interfiere con el backend que corre en el `3000`.

#### Cómo hacerlo:
1. Abrí menú de comandos en VS Code (`Ctrl + Shift + P`)
2. Escribí: `Preferences: Open Settings (JSON)`
3. Agregá esta línea:
   ```json
   "liveServer.settings.port": 5500
   ```
4. Guardá el archivo y reiniciá Live Server



1. Abrí `docs/frontend/docs/index.html` en VS Code.
2. Hacé clic derecho y seleccioná **"Open with Live Server"**.

---

## 🧩 Estructura del proyecto

```
comparacion-de-precios/
│
├── docs/
│   ├── backend/
│   │   ├── app.js
│   │   ├── serviceAccountKey.json
│   │   ├── .env
│   │   └── ...
│   └── frontend/
│       └── docs/index.html
│
├── SQL/
│   └── bd_ggprice.sql
└── .envEjemplo
```

---

## ❗ Solución de problemas

- ⚠ **Error al iniciar servidor**: revisá si el puerto 3000 está libre.
- ⚠ **Firebase no responde**: verificá la ubicación y contenido del archivo `serviceAccountKey.json`.
- ⚠ **Error de conexión MySQL**: revisá las credenciales y que MySQL esté corriendo.
- ⚠ **Correo no enviado**: asegurate de tener contraseña de aplicación válida en Gmail.

---

## 🔒 Buenas prácticas

- 🛑 **Nunca subas** `.env` o `serviceAccountKey.json` a un repositorio público.
- 🔐 Las contraseñas se hashean automáticamente con **bcrypt**.
- ✅ Para producción, se recomienda usar **Firebase Authentication** directamente.

---

## 📚 Recursos útiles

- [Firebase Documentation](https://firebase.google.com/docs)
- [RAWG API Docs](https://rawg.io/apidocs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [MySQL Manual](https://dev.mysql.com/doc/)

---

## ✅ ¡Todo listo!

Ahora podés usar GGPRICE en tu entorno local. 🎮💸  