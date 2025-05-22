const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
  const { search, ordering, page_size } = req.query;
  const API_KEY = "4b1742eb29634e329d7fd29447d706ca";
  let url = `https://api.rawg.io/api/games?key=${API_KEY}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (ordering) url += `&ordering=${ordering}`;
  if (page_size) url += `&page_size=${page_size}`;

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
  const API_KEY = "4b1742eb29634e329d7fd29447d706ca";
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
  try {
    // ¿Usuario ya existe?
    const usuarioExistente = await db.collection('usuarios').where('mail', '==', mail).get();
    if (!usuarioExistente.empty) {
      return res.status(400).json({ error: 'El mail ya está registrado' });
    }
    // Crear usuario
    const usuarioNuevo = {
      nickname,
      mail,
      password, //password en texto plano (agregar mejor seguridad)
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
  if (!mail || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    const query = await db.collection('usuarios')
      .where('mail', '==', mail)
      .where('password', '==', password)
      .get();
    if (query.empty) {
      return res.status(401).json({ error: 'Mail o contraseña incorrectos' });
    }
    const userData = query.docs[0].data();
    res.json({
      message: 'Login correcto',
      user: {
        nickname: userData.nickname,
        mail: userData.mail,
        img_perfil: userData.img_perfil
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en login' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor GGPRICE escuchando en http://localhost:${PORT}`);
});