const API_KEY = "4b1742eb29634e329d7fd29447d706ca";
const cardTempl = document.getElementById("template-precio").content;
const fragment = document.createDocumentFragment();
const listTarjetas = document.querySelector(".precios__lista");
let tiendasPorId = {};

// Obtener el ID de la URL
const obtenerIdDeURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

//Conectar con la api rawg para pedir mas detalles
const pedirDetalles = (juegoId) => {
  fetch(`http://localhost:3000/api/juegos/${juegoId}`)
    .then((res) => res.json())
    .then((data) => {
      pintarDetalles(data);
      guardarJuegoEnBD(data);
      obtenerNegocios().then(() => {
        obtenerPrecios(data.name);
      });
      console.log(data.name);
    });
};

const guardarJuegoEnBD = async (juego) => {
  const body = {
    id_juego: juego.id,
    titulo: juego.name,
    descripcion: juego.description_raw,
    imagen_url: juego.background_image,
    fecha_lanzamiento: juego.released,
    rating: juego.rating,
    generos: juego.genres.map(g => g.name),
    plataformas: juego.platforms.map(p => p.platform.name)
  };

  try {
    await fetch('http://localhost:3000/api/juegos/guardar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error("No se pudo guardar el juego en MySQL:", err);
  }
};

//Pintar las cards con los datos obtenidos de la api
const pintarDetalles = (juego) => {
  document.querySelector(".juego__imagen").src = juego.background_image;
  document.querySelector(".juego__titulo").textContent = juego.name;
  const lanzamiento = juego.released ? juego.released : "-";
  document.querySelector(".juego__fecha").textContent = lanzamiento;

  const plataformas = Array.isArray(juego.platforms)
    ? juego.platforms
      .filter((p) => p.platform && p.platform.name)
      .map((p) => p.platform.name)
      .join(", ")
    : "Plataformas no disponibles";

  document.querySelector(".juego__plataformas").textContent = plataformas;

  // Traducción de la descripción
  if (juego.description_raw) {
    traducirConLingva(juego.description_raw, function (traduccion) {
      document.querySelector(".juego__descripcion--text").textContent =
        traduccion;
    });
  } else {
    document.querySelector(".juego__descripcion--text").textContent =
      "Descripción no disponible.";
  }
};

//Diferencias las tiendas que venden el videojuego
const obtenerNegocios = () => {
  return fetch('http://localhost:3000/api/tiendas')
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      data.forEach((tienda) => {
        tiendasPorId[tienda.storeID] = tienda.storeName;
      });
    })
    .catch((error) => {
      console.error("Error al obtener los negocios:", error);
    });
};

//Pedir a la api los precios
const obtenerPrecios = (nombreJuego) => {
  fetch(
    `http://localhost:3000/api/precios?title=${encodeURIComponent(nombreJuego)}`
  )
    .then((res) => res.json())
    .then((data) => {
      pintarPrecios(data);
    });
};

//Pintar los precios
const pintarPrecios = (precios) => {
  //Para poder completar el titulo con el precio normal
  if (precios.length > 0) {
    const titulo = document.querySelector(".precios__titulo");
    titulo.textContent = `Precio normal: $${precios[0].normalPrice}`;
  } else {
    document.querySelector(".precios__titulo").textContent =
      "No se encontraron precios.";
    return;
  }
  const precioNormal = parseFloat(precios[0].normalPrice);

  precios.forEach((precio) => {
    const clone = cardTempl.cloneNode(true);

    clone.querySelector(".precio__tienda").textContent =
      tiendasPorId[precio.storeID] || "Tienda desconocida";

    const salePrice = parseFloat(precio.salePrice);
    const valorElemento = clone.querySelector(".precio__valor");
    valorElemento.textContent = `$${salePrice}`;

    // Cambiar color según comparación
    if (salePrice < precioNormal) {
      valorElemento.style.color = "green";
      valorElemento.textContent = `⭐ $${salePrice}`;
    } else if (salePrice > precioNormal) {
      valorElemento.style.color = "red";
    }

    clone.querySelector(
      ".precio__boton"
    ).href = `https://www.cheapshark.com/redirect?dealID=${precio.dealID}`;

    fragment.appendChild(clone);
  });

  listTarjetas.appendChild(fragment);
};

function traducirConLingva(texto, callback) {
  fetch(`https://lingva.ml/api/v1/en/es/${encodeURIComponent(texto)}`)
    .then((res) => res.json())
    .then((data) => {
      callback(data.translation);
    })
    .catch((error) => {
      console.error("Error con Lingva:", error);
      callback("Error al traducir.");
    });
}

// Ejecutar cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
  const id = obtenerIdDeURL();
  if (id) pedirDetalles(id);

  const btnFavorito = document.getElementById("btn-favorito");

  // Mostrar u ocultar el botón según si el usuario está logueado
  const usuario = JSON.parse(localStorage.getItem('usuarioGG'));
  if (usuario) {
    btnFavorito.style.display = 'inline-block';
  } else {
    btnFavorito.style.display = 'none';
  }

  btnFavorito.addEventListener("click", async () => {
    const usuario = JSON.parse(localStorage.getItem('usuarioGG'));
    if (!usuario || !usuario.id) {
      alert("Tenés que estar logueado para agregar favoritos");
      return;
    }

    const idJuego = obtenerIdDeURL();

    try {
      const resp = await fetch("http://localhost:3000/api/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id,
          id_juego: parseInt(idJuego)
        })
      });

      const data = await resp.json();
      if (resp.ok) {
        alert("✅ Juego agregado a tus favoritos");
      } else {
        alert("⚠️ " + (data.error || "No se pudo agregar"));
      }
    } catch (err) {
      alert("❌ Error al conectar con el servidor");
      console.error(err);
    }
  });
});



