document.addEventListener("DOMContentLoaded", function () {
  // ---- REFERENCIAS DESKTOP ----
  const menuOptions = document.getElementById("menu-options"); // ul
  const loginDesktop = document.getElementById("nav__abrir-login-desktop");
  const signupDesktop = document.getElementById("nav__abrir-singup-desktop");

  // ---- REFERENCIAS MOBILE ----
  const navMovil = document.getElementById("nav-movil");
  const navUlMovil = navMovil.querySelector(".nav-ul-movil");
  const loginMobile = document.getElementById("nav__abrir-login");
  const signupMobile = document.getElementById("nav__abrir-singUp");

  // ---- REFERENCIAS AVATAR Y BOTONES ----
  const avatar = document.getElementById("profile-avatar");
  const menuButton = document.getElementById("menu-button");
  const closeButton = document.getElementById("menu-cerrar");

  // Crear botón de cerrar sesión para desktop (si no existe)
  let logoutDesktop = document.getElementById("nav__logout-desktop");
  if (!logoutDesktop) {
    logoutDesktop = document.createElement("li");
    logoutDesktop.id = "nav__logout-desktop";
    logoutDesktop.className = "menu__options--item";
    logoutDesktop.textContent = "Cerrar sesión";
    logoutDesktop.style.display = "none";
    menuOptions.appendChild(logoutDesktop);
  }

  // Crear botón de cerrar sesión para mobile (si no existe)
  let logoutMobile = document.getElementById("nav__logout-mobile");
  if (!logoutMobile) {
    logoutMobile = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = "Cerrar sesión";
    link.id = "nav__logout-mobile";
    logoutMobile.appendChild(link);
    logoutMobile.style.display = "none";
    navUlMovil.appendChild(logoutMobile);
  }

  // --- FUNCIONES DE CONTROL ---

  function actualizarMenuSegunSesion() {
    const usuario = localStorage.getItem("usuarioGG");
    const logueado = !!usuario;

    // Desktop
    loginDesktop.style.display = logueado ? "none" : "";
    signupDesktop.style.display = logueado ? "none" : "";
    logoutDesktop.style.display = logueado ? "" : "none";

    // Mobile
    loginMobile.parentElement.style.display = logueado ? "none" : "";
    signupMobile.parentElement.style.display = logueado ? "none" : "";
    logoutMobile.style.display = logueado ? "" : "none";

    // Avatar y hamburguesa
    if (logueado && avatar) {
      const user = JSON.parse(usuario);
      avatar.src = user.img_perfil || './assets/avatar-default.png';
      avatar.style.display = 'inline-block';
      menuButton.style.setProperty('display', 'none', 'important');
      closeButton.style.display = 'none';
    } else if (avatar) {
      avatar.style.display = 'none';
      menuButton.style.setProperty('display', 'inline-block', 'important');
      closeButton.style.display = 'none';
    }
  }

  // Al cargar
  actualizarMenuSegunSesion();

  // ---- CERRAR SESIÓN ----
  function cerrarSesion() {
    localStorage.removeItem("usuarioGG");
    actualizarMenuSegunSesion();
    // Opcional: redireccionar a la home
    window.location.href = "index.html";
  }

  // Eventos cerrar sesión
  logoutDesktop.addEventListener("click", cerrarSesion);
  logoutMobile.querySelector("a").addEventListener("click", function (e) {
    e.preventDefault();
    cerrarSesion();
    // También cerrar el menú hamburguesa si está abierto
    navMovil.classList.remove("visible");
    document.getElementById("menu-cerrar").classList.remove("visible");
    document.getElementById("menu-button").classList.add("visible");
  });

  // Por si el login se hace en otro archivo y no recarga, escucha cambios de localStorage
  window.addEventListener("storage", actualizarMenuSegunSesion);

  // Opcional: después de login/registro exitoso (en inicioSesion.js), llamá a actualizarMenuSegunSesion()
  // Ejemplo: luego de localStorage.setItem('usuarioGG', ...);
  // agregar: actualizarMenuSegunSesion();
  window.actualizarMenuSegunSesion = actualizarMenuSegunSesion;

  // --- AVATAR CLICK PARA ABRIR MENÚ ---
  if (avatar && navMovil) {
    avatar.addEventListener("click", function () {
      navMovil.classList.toggle("visible");
    });
  }
});
