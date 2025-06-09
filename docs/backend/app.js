const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require('dotenv').config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const app = express();

const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend/docs")));

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Prueba: endpoint básico
app.get('/', (req, res) => {
  res.send('¡GGPRICE backend funcionando!');
});

// Prueba: listar usuarios de Firestore
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuariosRef = db.collection('usuarios');
    const snapshot = await usuariosRef.get();
    const usuarios = [];
    snapshot.forEach(doc => usuarios.push({ id: doc.id, ...doc.data() }));
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para buscar juegos en RAWG
app.get('/api/juegos', async (req, res) => {
  const { search, ordering, page_size, page } = req.query;
  const API_KEY = process.env.RAWG_API_KEY;
  let url = `https://api.rawg.io/api/games?key=${API_KEY}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (ordering) url += `&ordering=${ordering}`;
  if (page_size) url += `&page_size=${page_size}`;
  if (page) url += `&page=${page}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error consultando la API de RAWG" });
  }
});

// Endpoint para detalles de un juego por ID
app.get('/api/juegos/:id', async (req, res) => {
  const { id } = req.params;
  const API_KEY = process.env.RAWG_API_KEY;
  const url = `https://api.rawg.io/api/games/${id}?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error consultando detalles del juego" });
  }
});

// Endpoint para buscar precios de un juego
app.get('/api/precios', async (req, res) => {
  const { title } = req.query;
  if (!title) return res.status(400).json({ error: "Falta el parámetro 'title'" });

  try {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(title)}&exact=1`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error consultando CheapShark" });
  }
});

// Endpoint para obtener tiendas
app.get('/api/tiendas', async (req, res) => {
  try {
    const response = await fetch('https://www.cheapshark.com/api/1.0/stores');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error consultando tiendas en CheapShark" });
  }
});

// Endpoint para registrar usuario
app.post('/api/usuarios/registro', async (req, res) => {
  const { nickname, mail, password, img_perfil } = req.body;
  if (!nickname || !mail || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const normalizedMail = mail.trim().toLowerCase();
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  try {
    // ¿Usuario ya existe?
    const usuarioExistente = await db.collection('usuarios').where('mail', '==', normalizedMail).get();
    if (!usuarioExistente.empty) {
      return res.status(400).json({ error: 'El mail ya está registrado' });
    }
    // Crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const usuarioNuevo = {
      nickname,
      mail:normalizedMail,
      password: hashedPassword,
      img_perfil: img_perfil || ''
    };
    const docRef = await db.collection('usuarios').add(usuarioNuevo);
    res.json({ message: 'Usuario registrado', id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Endpoint para login de usuario
app.post('/api/usuarios/login', async (req, res) => {
  const { mail, password } = req.body;
  const normalizedMail = mail.trim().toLowerCase();
  if (!mail || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    const query = await db.collection('usuarios').where('mail', '==', normalizedMail).get();
    if (query.empty) {
      return res.status(401).json({ error: 'Mail o contraseña incorrectos' });
    }
    const userDoc = query.docs[0];
    const userData = userDoc.data();
    const coincide = await bcrypt.compare(password, userData.password);

    if (!coincide) {
      return res.status(401).json({ error: 'Mail o contraseña incorrectos' });
    }
    res.json({
      message: 'Login correcto',
      user: {
        id: query.docs[0].id, // <-- AGREGÁ ESTA LÍNEA
        nickname: userData.nickname,
        mail: userData.mail,
        img_perfil: userData.img_perfil
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en login' });
  }
});

// Endpoint para guardar juegos en cache
app.post('/api/juegos/guardar', async (req, res) => {
  const {
    id_juego,
    titulo,
    descripcion,
    imagen_url,
    fecha_lanzamiento,
    rating,
    generos,
    plataformas
  } = req.body;

  if (!id_juego || !titulo) return res.status(400).json({ error: 'Faltan datos obligatorios' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insertar o actualizar el juego
    await conn.query(`
      INSERT INTO juegos (id_juego, titulo, descripcion, imagen_url, fecha_lanzamiento, rating, ultima_actualizacion)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        titulo = VALUES(titulo),
        descripcion = VALUES(descripcion),
        imagen_url = VALUES(imagen_url),
        fecha_lanzamiento = VALUES(fecha_lanzamiento),
        rating = VALUES(rating),
        ultima_actualizacion = NOW()
    `, [id_juego, titulo, descripcion, imagen_url, fecha_lanzamiento, rating]);

    // Insertar géneros
    for (let genero of generos) {
      const [rows] = await conn.query(`SELECT id_genero FROM generos WHERE nombre = ?`, [genero]);
      let id_genero;
      if (rows.length > 0) {
        id_genero = rows[0].id_genero;
      } else {
        const result = await conn.query(`INSERT INTO generos (nombre) VALUES (?)`, [genero]);
        id_genero = result[0].insertId;
      }
      await conn.query(`INSERT IGNORE INTO juego_genero (id_juego, id_genero) VALUES (?, ?)`, [id_juego, id_genero]);
    }

    // Insertar plataformas
    for (let plataforma of plataformas) {
      const [rows] = await conn.query(`SELECT id_plataforma FROM plataformas WHERE nombre = ?`, [plataforma]);
      let id_plataforma;
      if (rows.length > 0) {
        id_plataforma = rows[0].id_plataforma;
      } else {
        const result = await conn.query(`INSERT INTO plataformas (nombre) VALUES (?)`, [plataforma]);
        id_plataforma = result[0].insertId;
      }
      await conn.query(`INSERT IGNORE INTO juego_plataforma (id_juego, id_plataforma) VALUES (?, ?)`, [id_juego, id_plataforma]);
    }

    await conn.commit();
    res.json({ message: 'Juego guardado correctamente' });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el juego' });
  } finally {
    conn.release();
  }
});

// Endpoint para guardar juegos en favoritos
app.post('/api/favoritos', async (req, res) => {
  const { id_usuario, id_juego } = req.body;

  if (!id_usuario || !id_juego) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const conn = await pool.getConnection();
    const query = `
      INSERT IGNORE INTO favoritos (id_usuario, id_juego, fecha_agregado)
      VALUES (?, ?, NOW())
    `;
    await conn.query(query, [id_usuario, id_juego]);
    conn.release();

    res.json({ message: 'Juego agregado a favoritos' });
  } catch (err) {
    console.error("Error al agregar a favoritos:", err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Endpoint para obtener favoritos de un usuario
app.get('/api/favoritos/:id_usuario', async (req, res) => {
  const id_usuario = req.params.id_usuario;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const offset = (page - 1) * limit;

  try {
    const conn = await pool.getConnection();

    // Obtener total de favoritos
    const [countRows] = await conn.query(
      `SELECT COUNT(*) AS total FROM favoritos WHERE id_usuario = ?`,
      [id_usuario]
    );
    const total = countRows[0].total;

    // Obtener juegos favoritos paginados
    const [juegos] = await conn.query(
      `SELECT j.*
       FROM favoritos f
       JOIN juegos j ON f.id_juego = j.id_juego
       WHERE f.id_usuario = ?
       ORDER BY f.fecha_agregado DESC
       LIMIT ? OFFSET ?`,
      [id_usuario, limit, offset]
    );

    // Por cada juego, buscar sus plataformas y géneros
    for (const juego of juegos) {
      const [plataformas] = await conn.query(
        `SELECT p.nombre FROM juego_plataforma jp
         JOIN plataformas p ON jp.id_plataforma = p.id_plataforma
         WHERE jp.id_juego = ?`,
        [juego.id_juego]
      );
      juego.plataformas = plataformas.map(p => p.nombre);

      const [generos] = await conn.query(
        `SELECT g.nombre FROM juego_genero jg
         JOIN generos g ON jg.id_genero = g.id_genero
         WHERE jg.id_juego = ?`,
        [juego.id_juego]
      );
      juego.generos = generos.map(g => g.nombre);
    }

    conn.release();
    res.json({ juegos, total });
  } catch (err) {
    console.error("Error al obtener favoritos:", err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Endpoint para eliminar favoritos
app.delete('/api/favoritos', async (req, res) => {
  const { id_usuario, id_juego } = req.body;

  if (!id_usuario || !id_juego) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const conn = await pool.getConnection();
    await conn.query(
      `DELETE FROM favoritos WHERE id_usuario = ? AND id_juego = ?`,
      [id_usuario, id_juego]
    );
    conn.release();
    res.json({ message: 'Juego eliminado de favoritos' });
  } catch (err) {
    console.error("Error al eliminar favorito:", err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

const PORT = process.env.PORT || 3000;

// Subir imagen de perfil 
app.post('/api/usuarios/:id/subir-foto', upload.single('foto'), async (req, res) => {
  const userId = req.params.id;
  if (!req.file) return res.status(400).json({ error: 'No se envió archivo' });

  try {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'ggprice_perfiles', resource_type: 'image' },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'Error al subir la imagen a Cloudinary' });
        }
        // Actualizá el campo img_perfil en Firestore
        await db.collection('usuarios').doc(userId).update({ img_perfil: result.secure_url });
        res.json({ url: result.secure_url });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno al subir la foto' });
  }
});

// Endpoint para traducir texto usando Lingva.ml (proxy para evitar CORS)
app.get('/api/traducir', async (req, res) => {
  const texto = req.query.texto;
  if (!texto) {
    return res.status(400).json({ error: 'Falta el texto a traducir' });
  }

  try {
    const response = await fetch(`https://lingva.ml/api/v1/en/es/${encodeURIComponent(texto)}`);
    if (!response.ok) {
      return res.status(500).json({ error: 'Error desde Lingva.ml' });
    }

    const data = await response.json();
    res.json(data); // contiene "translation"
  } catch (error) {
    console.error('Error al traducir con Lingva:', error);
    res.status(500).json({ error: 'Error al traducir con Lingva' });
  }
});

const tokensReset = new Map();

// Endpoint para recuperar contraseña
app.post('/api/usuarios/recuperar', async (req, res) => {
  const { mail } = req.body;
  const normalizedMail = mail.trim().toLowerCase();
  if (!mail) return res.status(400).json({ error: 'Falta el mail' });

  try {
    const query = await db.collection('usuarios').where('mail', '==', normalizedMail).get();
    if (query.empty) return res.status(404).json({ error: 'Mail no registrado' });

    const userDoc = query.docs[0];
    const userId = userDoc.id;

    // Crear token aleatorio
    const token = crypto.randomBytes(32).toString("hex");

    // Guardar en memoria por 15 minutos
    tokensReset.set(token, { userId, expires: Date.now() + 15 * 60 * 1000 });

    // Crear link
    const url = `http://localhost:3000/resetear.html?token=${token}`; // Reemplazá con tu dominio si es necesario

    // Configurar el transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    console.log("➡️ Enviando mail a:", mail);
    console.log("🔗 Enlace de reseteo:", url);

    await transporter.sendMail({
      from: `"GGPRICE" <${process.env.MAIL_USER}>`,
      to: mail,
      subject: "Reseteá tu contraseña - GGPRICE",
      html: `<p>Hiciste una solicitud para recuperar tu contraseña.</p>
             <p><a href="${url}">Haz clic acá para resetearla</a> (válido por 15 minutos)</p>`
    });

    res.json({ message: "📧 Se envió un enlace a tu email para resetear tu contraseña" });

  } catch (error) {
    console.error("Error en recuperación:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Endpoint para resetear contraseña
app.post('/api/usuarios/resetear', async (req, res) => {
  const { token, nuevaPassword } = req.body;
  if (!token || !nuevaPassword) return res.status(400).json({ error: 'Faltan datos' });

  const info = tokensReset.get(token);

  if (!info || Date.now() > info.expires) {
    return res.status(400).json({ error: 'El enlace expiró o es inválido' });
  }

  try {
    const hashed = await bcrypt.hash(nuevaPassword, 8);
    await db.collection('usuarios').doc(info.userId).update({ password: hashed });

    tokensReset.delete(token);

    res.json({ message: '✅ Contraseña actualizada correctamente' });
  } catch (err) {
    console.error("Error al actualizar contraseña:", err);
    res.status(500).json({ error: 'Error al actualizar contraseña' });
  }
});

app.get('/api/usuarios/validar-token', (req, res) => {
  const { token } = req.query;
  const info = tokensReset.get(token);
  if (!info || Date.now() > info.expires) {
    return res.status(400).json({ error: 'Token inválido o expirado' });
  }
  res.json({ message: 'Token válido' });
});



app.listen(PORT, () => {
  console.log(`Servidor GGPRICE escuchando en http://localhost:${PORT}`);
});