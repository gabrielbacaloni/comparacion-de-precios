const cardTemplate = document.getElementById("card__template").content;
const fragment = document.createDocumentFragment();
const listadoTarjetas = document.querySelector(".cards__container"); //Div donde se ubicarán las tarjetas

//cuando carga el html se ejecutará el pedido a la API y verificará si hay hay algo en la URL
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q");

  if (query) {
    document.querySelector(
      ".cards__title"
    ).textContent = `Resultados para: ${query}`;
    buscarJuego(query, selectOrden.value);
    history.replaceState({ tipo: "busqueda", query: query }, "", `?q=${query}`);
  } else {
    listarJuegosPopulares();
  }

  leerJuego();
});

/*Llamada a la api para traer los juegos populares */
const listarJuegosPopulares = () => {
  fetch(
    `https://api.rawg.io/api/games?key=${API_KEY}&ordering=-rating&page_size=20`
  )
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      const juegos = data.results;
      mostrarJuegosPopulares(juegos);
    });
};

/**Pintar las cards con los juegos populares*/
const mostrarJuegosPopulares = (data) => {
  data.forEach((juego) => {
    const clone = cardTemplate.cloneNode(true);

    clone.querySelector(".juego__img").src = juego.background_image; //Agregar una imagen por si no trae algo
    clone.querySelector(".juego__img").alt = juego.name;
    clone.querySelector(".juego__name").textContent = juego.name;
    const plataformas = Array.isArray(juego.platforms) //Chequeo antes si tiene un array de plataformas porque sino tira error
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
