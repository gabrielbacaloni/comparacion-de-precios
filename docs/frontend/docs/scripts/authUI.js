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
  const nicknameSpan = document.getElementById("profile-nickname");
  const profileHeader = document.getElementById("profile-header");
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

  // Cambiar foto Desktop
  let cambiarFotoDesktop = document.getElementById("nav__cambiar-foto-desktop");
  if (!cambiarFotoDesktop) {
    cambiarFotoDesktop = document.createElement("li");
    cambiarFotoDesktop.id = "nav__cambiar-foto-desktop";
    cambiarFotoDesktop.className = "menu__options--item";
    cambiarFotoDesktop.textContent = "Cambiar foto";
    cambiarFotoDesktop.style.display = "none";
    menuOptions.appendChild(cambiarFotoDesktop);
  }

  // Favoritos Desktop
  let favoritosDesktop = document.getElementById("nav__favoritos-desktop");
  if (!favoritosDesktop) {
    favoritosDesktop = document.createElement("li");
    favoritosDesktop.id = "nav__favoritos-desktop";
    favoritosDesktop.className = "menu__options--item";
    favoritosDesktop.textContent = "Favoritos";
    favoritosDesktop.style.display = "none";
    menuOptions.appendChild(favoritosDesktop);
  }

  // Cambiar foto Mobile
  let cambiarFotoMobile = document.getElementById("nav__cambiar-foto-mobile");
  if (!cambiarFotoMobile) {
    cambiarFotoMobile = document.createElement("li");
    cambiarFotoMobile.style.display = "none";
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = "Cambiar foto";
    link.id = "nav__cambiar-foto-mobile";
    cambiarFotoMobile.appendChild(link);
    navUlMovil.appendChild(cambiarFotoMobile);
  } else {
    cambiarFotoMobile = cambiarFotoMobile.parentElement; // el <li> padre
  }

  // Favoritos Mobile
  let favoritosMobile = document.getElementById("nav__favoritos-mobile");
  if (!favoritosMobile) {
    favoritosMobile = document.createElement("li");
    favoritosMobile.style.display = "none";
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = "Favoritos";
    link.id = "nav__favoritos-mobile";
    favoritosMobile.appendChild(link);
    navUlMovil.appendChild(favoritosMobile);
  } else {
    favoritosMobile = favoritosMobile.parentElement; // el <li> padre
  }
  // --- FUNCIONES DE CONTROL ---

  function actualizarMenuSegunSesion() {
    const usuario = localStorage.getItem("usuarioGG");
    const logueado = !!usuario;

    // Desktop
    loginDesktop.style.display = logueado ? "none" : "";
    signupDesktop.style.display = logueado ? "none" : "";
    cambiarFotoDesktop.style.display = logueado ? "" : "none";
    favoritosDesktop.style.display = logueado ? "" : "none";
    logoutDesktop.style.display = logueado ? "" : "none";

    // Mobile
    loginMobile.parentElement.style.display = logueado ? "none" : "";
    signupMobile.parentElement.style.display = logueado ? "none" : "";
    cambiarFotoMobile.style.display = logueado ? "" : "none";
    favoritosMobile.style.display = logueado ? "" : "none";
    logoutMobile.style.display = logueado ? "" : "none";

    // Avatar y hamburguesa
    if (logueado && avatar) {
      const user = JSON.parse(usuario);
      avatar.src = user.img_perfil || './assets/avatar-default.png';
      nicknameSpan.textContent = user.nickname || '';
      profileHeader.style.display = 'flex';
      avatar.style.display = 'inline-block';
      menuButton.style.setProperty('display', 'none', 'important');
      closeButton.style.display = 'none';
    } else if (avatar) {
       profileHeader.style.display = 'none';
      avatar.style.display = 'none';
      menuButton.style.setProperty('display', 'inline-block', 'important');
      closeButton.style.display = 'none';
    }
  }

  // Al cargar
  actualizarMenuSegunSesion();
  // Crear un input file invisible
  const inputFoto = document.createElement('input');
  inputFoto.type = 'file';
  inputFoto.accept = 'image/*';
  inputFoto.style.display = 'none';
  document.body.appendChild(inputFoto);

  // Click en Cambiar foto (desktop)
  cambiarFotoDesktop.addEventListener('click', () => inputFoto.click());
  // Click en Cambiar foto (mobile)
  cambiarFotoMobile.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    inputFoto.click();
  });

  // Cuando seleccionás una imagen
  inputFoto.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const usuario = JSON.parse(localStorage.getItem('usuarioGG'));
    if (!usuario) {
      alert("Debes estar logueado");
      return;
    }

    // Usar el id del usuario (doc.id), si solo guardaste el email, deberías guardar el id en localStorage
    const userId = usuario.id || usuario.mail;

    const formData = new FormData();
    formData.append('foto', file);

    const resp = await fetch(`${API_URL}/api/usuarios/${userId}/subir-foto`, {
      method: 'POST',
      body: formData
    });

    const data = await resp.json();
    if (resp.ok && data.url) {
      usuario.img_perfil = data.url;
      localStorage.setItem('usuarioGG', JSON.stringify(usuario));
      if (avatar) avatar.src = data.url;
      alert('Foto de perfil actualizada');
    } else {
      alert(data.error || 'Error al subir la foto');
    }
  });

  // Enlace al botón de Favoritos - Desktop
  favoritosDesktop.addEventListener("click", () => {
    window.location.href = "favoritos.html";
  });

  // Enlace al botón de Favoritos - Mobile
  favoritosMobile.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "favoritos.html";
  });

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

  window.actualizarMenuSegunSesion = actualizarMenuSegunSesion;

  window.addEventListener("load", actualizarMenuSegunSesion);

  // --- AVATAR CLICK PARA ABRIR MENÚ ---
  if (avatar && navMovil) {
    avatar.addEventListener("click", function () {
      navMovil.classList.toggle("visible");
    });
  }
});
