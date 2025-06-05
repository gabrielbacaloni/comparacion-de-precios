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

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑 Quitar";
      btnEliminar.classList.add("btn-eliminar-fav");

      btnEliminar.addEventListener("click", async (e) => {
        e.stopPropagation(); // evita que se dispare el redireccionamiento

        const confirmado = confirm("¿Querés quitar este juego de tus favoritos?");
        if (!confirmado) return;

        try {
          const resp = await fetch("http://localhost:3000/api/favoritos", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_usuario: usuario.id,
              id_juego: juego.id_juego
            })
          });

          const data = await resp.json();
          if (resp.ok) {
            alert("Favorito eliminado");
            location.reload(); // o quitá el elemento directamente del DOM
          } else {
            alert("Error: " + (data.error || "No se pudo eliminar"));
          }
        } catch (err) {
          console.error("Error al eliminar favorito:", err);
          alert("Error al conectar con el servidor");
        }
      });

      template.querySelector(".container__juego--info").appendChild(btnEliminar);

      favoritosContainer.appendChild(template);
    });

  } catch (err) {
    console.error("Error al cargar favoritos:", err);
    mensajeSinFavoritos.textContent = "Error al cargar tus favoritos.";
    mensajeSinFavoritos.style.display = "block";
  }
});