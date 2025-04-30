// 1. Leer nombre del juego desde la URL
const params = new URLSearchParams(window.location.search);
const nombreJuego = params.get("juego");

// 2. Diccionario para guardar tiendas (storeID → {nombre, logo})
let tiendas = {};

// 3. Función para mostrar imagen y descripción del juego
function mostrarInfoJuego(nombreJuego) {
  const imagenJuego = document.getElementById("imagen-juego");
  const descripcionJuego = document.getElementById("descripcion-juego");

  // Imagen simulada temporal
  imagenJuego.src = `https://via.placeholder.com/300x400?text=${encodeURIComponent(nombreJuego)}`;
  imagenJuego.alt = `Imagen del juego ${nombreJuego}`;

  // Descripción simulada
  descripcionJuego.textContent = `Aquí va una descripción breve del juego "${nombreJuego}". Podés reemplazarla con una API como RAWG si querés datos reales.`;
}

// 4. Función para cargar todas las tiendas una vez
function cargarTiendas() {
  fetch('https://www.cheapshark.com/api/1.0/stores')
    .then(res => res.json())
    .then(data => {
      data.forEach(tienda => {
        tiendas[tienda.storeID] = {
          nombre: tienda.storeName,
          logo: `https://www.cheapshark.com${tienda.images.logo}`
        };
      });

      // Una vez cargadas las tiendas, mostrar info y buscar ofertas
      if (nombreJuego) {
        document.getElementById("nombre-juego").textContent = nombreJuego;
        mostrarInfoJuego(nombreJuego);
        obtenerOfertasCheapShark(nombreJuego);
      }
    })
    .catch(error => {
      console.error('Error al cargar tiendas:', error);
    });
}

// 5. Función para buscar las ofertas de un juego
function obtenerOfertasCheapShark(nombreJuego) {
  fetch(`https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(nombreJuego)}`)
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("ofertas");
      contenedor.innerHTML = "";

      if (data.length === 0) {
        contenedor.innerHTML = "<p>No hay ofertas disponibles para este juego.</p>";
        return;
      }

      data.forEach(oferta => {
        const infoTienda = tiendas[oferta.storeID] || { nombre: `Tienda ${oferta.storeID}`, logo: '' };

        const div = document.createElement("div");
        div.classList.add("oferta");

        div.innerHTML = `
          <div class="oferta__tienda">
            ${infoTienda.logo ? `<img src="${infoTienda.logo}" alt="${infoTienda.nombre}" class="oferta__logo">` : ''}
            <strong class="oferta__nombre-tienda">${infoTienda.nombre}</strong>
          </div>
          <p class="oferta__precio"><strong>Precio oferta:</strong> $${oferta.salePrice}</p>
          <p class="oferta__precio-normal"><strong>Precio normal:</strong> $${oferta.normalPrice}</p>
          <a href="https://www.cheapshark.com/redirect?dealID=${oferta.dealID}" target="_blank" class="oferta__link">Ir a tienda</a>
          <hr class="oferta__separador">
        `;

        contenedor.appendChild(div);
      });
    })
    .catch(error => {
      console.error('Error buscando ofertas:', error);
    });
}

// 6. Empezar el proceso
cargarTiendas();
