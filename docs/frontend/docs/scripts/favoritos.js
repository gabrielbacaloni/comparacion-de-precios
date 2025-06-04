document.addEventListener("DOMContentLoaded", () => {
  const favoritosContainer = document.getElementById("favoritos-container");
  const mensajeSinFavoritos = document.getElementById("mensaje-sin-favoritos");

  const usuario = JSON.parse(localStorage.getItem("usuarioGG"));
  if (!usuario) {
    mensajeSinFavoritos.textContent = "Iniciá sesión para ver tus favoritos.";
    mensajeSinFavoritos.style.display = "block";
    return;
  }

  // Supongamos que tus favoritos están en localStorage
  const favoritos = JSON.parse(localStorage.getItem("favoritosGG")) || [];

  if (favoritos.length === 0) {
    mensajeSinFavoritos.style.display = "block";
  } else {
    mensajeSinFavoritos.style.display = "none";
    favoritos.forEach(juego => {
      // Podés armar tus cards acá o llamar a una función que lo haga
      const div = document.createElement("div");
      div.textContent = juego.name;
      favoritosContainer.appendChild(div);
    });
  }
});
