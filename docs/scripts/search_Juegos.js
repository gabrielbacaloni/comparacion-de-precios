const API_KEY = "4b1742eb29634e329d7fd29447d706ca";
const imputSearch = document.querySelector(".search__form");
const selectOrden = document.getElementById("ordenar-select");

//Conectar a la api de búsqueda
const buscarJuego = (nombre, orden = "relevancia") => {
  let ordering = "";
  if (orden === "rating_desc") ordering = "-rating";
  else if (orden === "rating_asc") ordering = "rating";
  else if (orden === "fecha_desc") ordering = "-released";
  else if (orden === "fecha_asc") ordering = "released";

  fetch(
    `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(
      nombre
    )}${ordering ? `&ordering=${ordering}` : ""}`
  )
    .then((res) => res.json())
    .then((data) => {
      const result = data.results;
      console.log(result);
      pintarCards(result);
    });
};

//Leer lo escrito en el buscador
const leerJuego = () => {
  imputSearch.addEventListener("submit", (e) => {
    e.preventDefault();
    const juegoSearch = document
      .querySelector(".search__form--input")
      .value.trim();
    buscarJuego(juegoSearch, selectOrden.value);
    history.pushState(
      { tipo: "busqueda", query: juegoSearch },
      "",
      `?q=${encodeURIComponent(juegoSearch)}`
    );
    // Guarda un estado cada vez q se hace una búsqueda
    document.querySelector(
      ".cards__title"
    ).textContent = `Resultados para: ${juegoSearch}`;
    imputSearch.reset();
  });
};

//Escuchar el click en el select para ordenal los juegos según un criterio
selectOrden.addEventListener("change", () => {
  const estadoActual = history.state;
  if (estadoActual && estadoActual.tipo === "busqueda" && estadoActual.query) {
    listadoTarjetas.innerHTML = "";
    buscarJuego(estadoActual.query, selectOrden.value);
  }
});

//Pintar las cards con la información de los juegos según lo que se buscó
const pintarCards = (data) => {
  if (data.length === 0) {
    listadoTarjetas.innerHTML =
      "<p>No se encontraron juegos con ese nombre</p>";
    return;
  }
  listadoTarjetas.innerHTML = "";
  data.forEach((juego) => {
    const clone = cardTemplate.cloneNode(true);

    clone.querySelector(".juego__img").src = juego.background_image; //Agregar una imagen por si no trae algo
    clone.querySelector(".juego__img").alt = juego.name;
    clone.querySelector(".juego__name").textContent = juego.name;
    const plataformas = Array.isArray(juego.platforms) //Chequar antes si tiene un array de plataformas porque sino tira error
      ? juego.platforms
          .filter((p) => p.platform && p.platform.name)
          .map((p) => p.platform.name)
          .join(", ")
      : "Plataformas no disponibles";
    const lanzamiento = juego.released ? juego.released : "-";
    clone.querySelector(
      ".juego__lanzamiento"
    ).textContent = `Lanzado: ${lanzamiento}`;
    clone.querySelector(".juego__rating").textContent = `⭐ ${juego.rating}`;
    clone.querySelector(".juego__generos").textContent = juego.genres
      .map((g) => g.name)
      .join(", ");

    //Al clickear una card envia a la pagina de detalle
    clone.querySelector(".card__juego").addEventListener("click", () => {
      window.location.href = `detalle.html?id=${juego.id}`;
    });

    fragment.appendChild(clone);
  });
  listadoTarjetas.appendChild(fragment);
};

window.addEventListener("popstate", (event) => {
  if (!event.state) {
    // Si no hay estado guardado, volvemos al inicio (juegos populares)
    listadoTarjetas.innerHTML = "";
    document.querySelector(".cards h3").textContent = "Juegos más populares";
    listarJuegosPopulares();
  } else if (event.state.tipo === "busqueda" && event.state.query) {
    // Si volvemos a un estado de búsqueda, hacemos la búsqueda de nuevo
    listadoTarjetas.innerHTML = "";
    document.querySelector(
      ".cards h3"
    ).textContent = `Resultados para: ${event.state.query}`;
    buscarJuego(event.state.query);
  }
});
