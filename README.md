# Instrucciones para ejecutar el proyecto GGPRICE en tu PC

## 1) Configurar Firebase y variables de entorno

Creá un archivo que se llame `serviceAccountKey.json` en esta ruta:

    comparacion-de-precios/docs/backend/

Abrí el archivo `serviceAccountKey.txt` que dejé en el drive, copiá todo su contenido y pegalo dentro del archivo `serviceAccountKey.json`.

Ahora en la misma carpeta, creá un archivo que se llame `.env` y copiá todo el contenido del archivo `env` que también dejé en el drive. Este archivo contiene las claves de Cloudinary, la API key de RAWG y los datos de conexión a la base de datos MySQL.

---

## 2) Verificar Node.js

Abrí la terminal en VS Code y ubicáte en:

    comparacion-de-precios/docs/backend/

Escribí:

    node -v

Si no tenés Node.js instalado, descargalo desde el navegador, instalalo y después volvé a intentar.

---

## 3) Instalar servidor MySQL

Instalá AppServ o cualquier paquete similar como WAMP o XAMPP.

Durante la instalación:

- Usuario: `root`
- Contraseña: usá una fácil de recordar o la misma que configuraste en el archivo `.env`.

---

## 4) Configurar MySQL con phpMyAdmin

- Iniciá los servicios (por ejemplo, en AppServ hacé clic en "Apache Start").
- Abrí tu navegador y andá a:

      http://localhost

- Buscá y hacé clic en **“phpMyAdmin Database Manager”**.
- Iniciá sesión con:
  - Usuario: `root`
  - Contraseña: la que configuraste antes.

---

## 5) Importar la base de datos

- Dentro de phpMyAdmin:
  - Creá una base de datos con nombre `bd_ggprice` y cotejamiento `utf8mb4_unicode_ci`.
  - Ingresá a la base.
  - Hacé clic en "Importar".
  - Subí el archivo `.sql` que dejé en la carpeta `SQL` del repositorio.

---

## 6) Ejecutar el backend

En la terminal de VS Code, ubicáte en:

    comparacion-de-precios/docs/backend/

Ejecutá:

    npm install

Cuando finalice, iniciá el servidor con:

    node app.js

Deberías ver un mensaje como:

    Servidor GGPRICE escuchando en http://localhost:3000

---

## 7) Ejecutar el frontend

- Instalá la extensión **Live Server** en Visual Studio Code.
- Hacé clic derecho sobre `index.html` (dentro de `docs/frontend/docs/`) y elegí:

      Open with Live Server

- Se va a abrir el navegador por defecto y listo, la aplicación debería funcionar correctamente.

---

## INFO ADICIONAL

Si por alguna razón necesitan entrar a Cloudinary o a Firebase, en WhatsApp les había enviado el mail y la contraseña de la cuenta de Google que creé justamente para el proyecto.
