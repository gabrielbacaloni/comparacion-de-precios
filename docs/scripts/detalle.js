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
  fetch(`https://api.rawg.io/api/games/${juegoId}?key=${API_KEY}`)
    .then((res) => res.json())
    .then((data) => {
      pintarDetalles(data);
      obtenerNegocios().then(() => {
        obtenerPrecios(data.name);
      });
      console.log(data.name);
    });
};

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

  document.querySelector(".juego__descripcion--text").textContent =
    juego.description_raw;
};

const obtenerNegocios = () => {
  return fetch("https://www.cheapshark.com/api/1.0/stores")
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
    `https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(
      nombreJuego
    )}&exact=1`
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

// Ejecutar cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
  const id = obtenerIdDeURL();
  if (id) {
    pedirDetalles(id);
  } else {
    console.error("No se encontró el ID en la URL");
  }
});
