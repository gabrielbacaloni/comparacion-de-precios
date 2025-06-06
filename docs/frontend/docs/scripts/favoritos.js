document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("favoritos-container");
  const mensaje = document.getElementById("mensaje-sin-favoritos");
  const paginadorArriba = document.createElement("div");
  const paginadorAbajo = document.createElement("div");
  paginadorArriba.className = paginadorAbajo.className = "paginador";
  container.before(paginadorArriba);
  container.after(paginadorAbajo);

  const usuario = JSON.parse(localStorage.getItem("usuarioGG"));
  if (!usuario || !usuario.id) {
    mensaje.textContent = "Iniciá sesión para ver tus favoritos.";
    mensaje.style.display = "block";
    return;
  }

  const favoritosPorPagina = 8;
  let paginaActual = 1;

  const cargarFavoritos = async (pagina) => {
    container.innerHTML = "";
    mensaje.style.display = "none";
    paginadorArriba.innerHTML = "";
    paginadorAbajo.innerHTML = "";

    try {
      const resp = await fetch(`http://localhost:3000/api/favoritos/${usuario.id}?page=${pagina}&limit=${favoritosPorPagina}`);
      const data = await resp.json();
      const juegos = data.juegos;
      const total = data.total;

      if (!juegos.length) {
        mensaje.style.display = "block";
        return;
      }

      juegos.forEach(juego => {
        const template = document.getElementById("card__template").content.cloneNode(true);
        template.querySelector(".juego__img").src = juego.imagen_url;
        template.querySelector(".juego__name").textContent = juego.titulo;
        template.querySelector(".juego__plataformas").textContent =
          "Plataformas: " + (juego.plataformas.length ? juego.plataformas.join(", ") : "(ninguna)");

        const fecha = juego.fecha_lanzamiento
          ? new Date(juego.fecha_lanzamiento).toLocaleDateString("es-AR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          })
          : "-";
        template.querySelector(".juego__lanzamiento").textContent = "Lanzado: " + fecha;

        const rating = parseFloat(juego.rating);
        template.querySelector(".juego__rating").textContent = isNaN(rating) ? "⭐ -" : `⭐ ${rating.toFixed(2)}`;
        template.querySelector(".juego__generos").textContent =
          juego.generos.length ? juego.generos.join(", ") : "(sin géneros)";

        // Ir al detalle al hacer click
        template.querySelector(".card__juego").addEventListener("click", () => {
          window.location.href = `detalle.html?id=${juego.id_juego}`;
        });

        // Eliminar favorito
        template.querySelector(".general_btn").addEventListener("click", async (e) => {
          e.stopPropagation(); // evita que se dispare el evento de redirección
          const confirmado = confirm("¿Seguro que querés eliminar este juego de tus favoritos?");
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

            if (resp.ok) {
              alert("Juego eliminado de favoritos");
              cargarFavoritos(paginaActual);
            } else {
              alert("No se pudo eliminar el favorito");
            }
          } catch (err) {
            console.error("Error eliminando favorito:", err);
            alert("Error de conexión con el servidor");
          }
        });

        container.appendChild(template);
      });


      const totalPaginas = Math.ceil(total / favoritosPorPagina);
      crearPaginador(paginadorArriba, totalPaginas);
      crearPaginador(paginadorAbajo, totalPaginas);

    } catch (err) {
      console.error("Error al cargar favoritos:", err);
      mensaje.textContent = "Error al cargar favoritos.";
      mensaje.style.display = "block";
    }
  };

  const crearPaginador = (contenedor, totalPaginas) => {
    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = (i === paginaActual) ? "pagina-activa" : "";
      btn.addEventListener("click", () => {
        paginaActual = i;
        cargarFavoritos(i);
      });
      contenedor.appendChild(btn);
    }
  };

  cargarFavoritos(paginaActual);
});