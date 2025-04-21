const API_KEY = "4b1742eb29634e329d7fd29447d706ca";
const impupSearch = document.querySelector(".search__form");

//Conectar a la api de búsqueda
const buscarJuego = (nombre) => {
  fetch(
    `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(
      nombre
    )}`
  )
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      const result = data.results;
      console.log(result);
    });
};

const leerProducto = () => {
  impupSearch.addEventListener("submit", (e) => {
    e.preventDefault();
    const juegoSearch = document
      .querySelector(".search__form--input")
      .value.trim();
    buscarJuego(juegoSearch);

    impupSearch.reset();
  });
};
