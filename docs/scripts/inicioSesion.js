// Ejecutar cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
  //Funciones reutilizables. Mostrar y ocultar
  function mostrarElemento(elemento) {
    elemento.style.display = "block";
    elemento.classList.remove("cerrar");
    elemento.classList.add("abrir");
  }

  function ocultarElemento(elemento) {
    elemento.classList.remove("abrir");
    elemento.classList.add("cerrar");
    setTimeout(() => {
      elemento.style.display = "none";
      backdrop.style.display = "none";
    }, 300);
  }

  // Llamada a los elementos a usar del html
  const hamburguesaMenu = document.getElementById("menu-button");
  const cerrarMenu = document.getElementById("menu-cerrar");
  const navMovil = document.getElementById("nav-movil");

  const abrirLogin = document.getElementById("nav__abrir-login");
  const popUpContainer = document.getElementById("container__iniciar-sesion");
  const cerrarPopup = document.getElementById("popUp__cerrar");

  const abrirRegistro = document.getElementById("nav__abrir-singUp");
  const popUpRegistro = document.getElementById("container__registrarse");
  const cerrarRegistro = document.getElementById("popUp__cerrar-registro");

  const abrirLoginDesktop = document.getElementById("nav__abrir-login-desktop");
  const abrirRegistroDesktop = document.getElementById(
    "nav__abrir-singup-desktop"
  );

  const backdrop = document.getElementById("modal-backdrop");

  //Cerrar y abrir el menú
  hamburguesaMenu.addEventListener("click", () => {
    hamburguesaMenu.classList.add("hidden");
    cerrarMenu.classList.add("visible");
    cerrarMenu.classList.remove("hidden");
    navMovil.classList.add("visible");
  });

  cerrarMenu.addEventListener("click", () => {
    hamburguesaMenu.classList.remove("hidden");
    hamburguesaMenu.classList.add("visible");
    cerrarMenu.classList.remove("visible");
    cerrarMenu.classList.add("hidden");
    navMovil.classList.remove("visible");
  });

  //Abrir la opción de iniciar sesión en movil
  abrirLogin.addEventListener("click", (e) => {
    e.preventDefault();
    backdrop.style.display = "block";
    mostrarElemento(popUpContainer);
  });

  //cerrar iniciar sesion en movil
  cerrarPopup.addEventListener("click", () => {
    ocultarElemento(popUpContainer);
  });

  //abrir la opción de registro en movil
  abrirRegistro.addEventListener("click", (e) => {
    e.preventDefault();
    backdrop.style.display = "block";
    mostrarElemento(popUpRegistro);
  });

  //cerrar la opcion de registro en movil
  cerrarRegistro.addEventListener("click", () => {
    ocultarElemento(popUpRegistro);
  });

  // Abrir iniciar sesión desde  desktop
  abrirLoginDesktop.addEventListener("click", (e) => {
    e.preventDefault();
    backdrop.style.display = "block";
    mostrarElemento(popUpContainer);
  });

  // Abrir registro desde v desktop
  abrirRegistroDesktop.addEventListener("click", (e) => {
    e.preventDefault();
    backdrop.style.display = "block";
    mostrarElemento(popUpRegistro);
  });

  //Al hacer click fuera desaparecen la card de registro o iniciar sesión
  backdrop.addEventListener("click", () => {
    if (popUpContainer.classList.contains("abrir")) {
      ocultarElemento(popUpContainer);
    }
    if (popUpRegistro.classList.contains("abrir")) {
      ocultarElemento(popUpRegistro);
    }
  });

  //cerrar el menu si se hace click afuera
  document.addEventListener("click", (e) => {
    const esClickDentroDelMenu =
      navMovil.contains(e.target) || hamburguesaMenu.contains(e.target);

    if (!esClickDentroDelMenu && navMovil.classList.contains("visible")) {
      navMovil.classList.remove("visible");
      cerrarMenu.classList.remove("visible");
      cerrarMenu.classList.add("hidden");
      hamburguesaMenu.classList.add("visible");
      hamburguesaMenu.classList.remove("hidden");
    }
  });
});
