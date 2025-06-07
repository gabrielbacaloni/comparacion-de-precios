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
  fetch(`${API_URL}/api/juegos/${juegoId}`)
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
    await fetch(`${API_URL}/api/juegos/guardar`, {
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
  return fetch(`${API_URL}/api/tiendas`)
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
  fetch(`${API_URL}/api/precios?title=${encodeURIComponent(nombreJuego)}`)
    .then((res) => res.json())
    .then((data) => {
      pintarPrecios(data);
    });
};

//Pintar los precios
const pintarPrecios = (precios) => {
  if (precios.length > 0) {
    const titulo = document.querySelector(".precios__titulo");
    titulo.textContent = `Precio normal: $${precios[0].normalPrice}`;
  } else {
    document.querySelector(".precios__titulo").textContent =
      "No se encontraron precios.";
    return;
  }
  precios.sort((a, b) => parseFloat(a.salePrice) - parseFloat(b.salePrice));
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
      ".general_btn"
    ).href = `https://www.cheapshark.com/redirect?dealID=${precio.dealID}`;

    fragment.appendChild(clone);
  });

  listTarjetas.appendChild(fragment);
};

function traducirConLingva(texto, callback) {
  fetch(`${API_URL}/api/traducir?texto=${encodeURIComponent(texto)}`)
    .then((res) => res.json())
    .then((data) => callback(data.translation))
    .catch((error) => {
      console.error("Error con traducción:", error);
      callback("Error al traducir.");
    });
}

// Ejecutar cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
  const id = obtenerIdDeURL();
  if (id) pedirDetalles(id);

  const btnFavorito = document.getElementById("btn-favorito");
  const usuario = JSON.parse(localStorage.getItem('usuarioGG'));

  if (!usuario || !usuario.id) {
    btnFavorito.style.display = "none";
    return;
  }

  // Mostrar botón y verificar si el juego está en favoritos
  btnFavorito.style.display = "inline-block";

  let estaEnFavoritos = false;

  const verificarFavorito = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/favoritos/${usuario.id}`);
      const data = await resp.json();
      const favoritos = data.juegos;

      estaEnFavoritos = favoritos.some(j => j.id_juego == id);
      btnFavorito.textContent = estaEnFavoritos ? "Eliminar de Favoritos" : "Agregar a Favoritos";
    } catch (err) {
      console.error("Error al verificar favoritos:", err);
    }
  };

  verificarFavorito();

  btnFavorito.addEventListener("click", async () => {
    try {
      if (estaEnFavoritos) {
        const confirmado = confirm("¿Seguro que querés eliminar este juego de tus favoritos?");
        if (!confirmado) return;

        const resp = await fetch(`${API_URL}/api/favoritos`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: usuario.id,
            id_juego: parseInt(id)
          })
        });

        if (resp.ok) {
          alert("❌ Juego eliminado de favoritos");
          estaEnFavoritos = false;
          btnFavorito.textContent = "Agregar a Favoritos";
        } else {
          alert("No se pudo eliminar");
        }

      } else {
        const resp = await fetch(`${API_URL}/api/favoritos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_usuario: usuario.id,
            id_juego: parseInt(id)
          })
        });

        if (resp.ok) {
          alert("✅ Juego agregado a favoritos");
          estaEnFavoritos = true;
          btnFavorito.textContent = "Eliminar de Favoritos";
        } else {
          const data = await resp.json();
          alert("No se pudo agregar: " + (data.error || ""));
        }
      }
    } catch (err) {
      console.error("Error en acción de favoritos:", err);
      alert("Error de conexión con el servidor");
    }
  });
});