document.addEventListener("DOMContentLoaded", async () => {
  const favoritosContainer = document.getElementById("favoritos-container");
  const mensajeSinFavoritos = document.getElementById("mensaje-sin-favoritos");

  const usuario = JSON.parse(localStorage.getItem("usuarioGG"));
  if (!usuario || !usuario.id) {
    mensajeSinFavoritos.textContent = "Iniciá sesión para ver tus favoritos.";
    mensajeSinFavoritos.style.display = "block";
    return;
  }

  try {
    const resp = await fetch(`http://localhost:3000/api/favoritos/${usuario.id}`);
    const juegos = await resp.json();

    if (!Array.isArray(juegos) || juegos.length === 0) {
      mensajeSinFavoritos.style.display = "block";
      return;
    }

    mensajeSinFavoritos.style.display = "none";

    juegos.forEach(juego => {
      const template = document.getElementById("card__template").content.cloneNode(true);
      template.querySelector(".juego__img").src = juego.imagen_url;
      template.querySelector(".juego__img").alt = juego.titulo;
      template.querySelector(".juego__name").textContent = juego.titulo;
      template.querySelector(".juego__plataformas").textContent = "Plataformas: (consultar)";
      template.querySelector(".juego__lanzamiento").textContent = "Lanzado: " + (juego.fecha_lanzamiento || "-");
      template.querySelector(".juego__rating").textContent = `⭐ ${juego.rating || '-'}`;
      template.querySelector(".juego__generos").textContent = "(sin datos de géneros)";
      
      template.querySelector(".card__juego").addEventListener("click", () => {
        window.location.href = `detalle.html?id=${juego.id_juego}`;
      });

      favoritosContainer.appendChild(template);
    });

  } catch (err) {
    console.error("Error al cargar favoritos:", err);
    mensajeSinFavoritos.textContent = "Error al cargar tus favoritos.";
    mensajeSinFavoritos.style.display = "block";
  }
});