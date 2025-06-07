document.addEventListener("DOMContentLoaded", () => {
  // Funciones reutilizables
  function mostrarElemento(elemento) {
    if (!elemento) return;
    elemento.style.display = "block";
    elemento.classList.remove("cerrar");
    elemento.classList.add("abrir");
  }

  function ocultarElemento(elemento) {
    if (!elemento) return;
    elemento.classList.remove("abrir");
    elemento.classList.add("cerrar");
    setTimeout(() => {
      elemento.style.display = "none";
      if (backdrop) backdrop.style.display = "none";
    }, 300);
  }


  // Elementos del DOM
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
  const abrirRegistroDesktop = document.getElementById("nav__abrir-singup-desktop");

  const backdrop = document.getElementById("modal-backdrop");

  const header = document.querySelector(".header");
  const formLogin = document.getElementById("popup--iniciar-sesion");
  const formRegistro = document.getElementById("popUp__registro");


  // Click en el header (para evitar redireccionamiento del logo)
  if (header) {
    header.addEventListener("click", (e) => {
      if (e.target.closest(".header__logo")) return;
      e.preventDefault();
    });
  }

  // Toggle menú hamburguesa
  if (hamburguesaMenu && cerrarMenu && navMovil) {
    hamburguesaMenu.addEventListener("click", () => {
      const abierto = navMovil.classList.contains("visible");
      navMovil.classList.toggle("visible", !abierto);
      cerrarMenu.classList.toggle("visible", !abierto);
      cerrarMenu.classList.toggle("hidden", abierto);
      hamburguesaMenu.classList.toggle("visible", abierto);
      hamburguesaMenu.classList.toggle("hidden", !abierto);
    });

    cerrarMenu.addEventListener("click", () => {
      navMovil.classList.remove("visible");
      cerrarMenu.classList.remove("visible");
      cerrarMenu.classList.add("hidden");
      hamburguesaMenu.classList.add("visible");
      hamburguesaMenu.classList.remove("hidden");
    });
  }

  // Eventos para login y registro (abrir/cerrar popups)
  if (abrirLogin && popUpContainer) {
    abrirLogin.addEventListener("click", (e) => {
      e.preventDefault();
      backdrop.style.display = "block";
      mostrarElemento(popUpContainer);
    });
  }

  if (cerrarPopup && popUpContainer) {
    cerrarPopup.addEventListener("click", () => ocultarElemento(popUpContainer));
  }

  if (abrirRegistro && popUpRegistro) {
    abrirRegistro.addEventListener("click", (e) => {
      e.preventDefault();
      backdrop.style.display = "block";
      mostrarElemento(popUpRegistro);
    });
  }

  if (cerrarRegistro && popUpRegistro) {
    cerrarRegistro.addEventListener("click", () => ocultarElemento(popUpRegistro));
  }

  if (abrirLoginDesktop && popUpContainer) {
    abrirLoginDesktop.addEventListener("click", (e) => {
      e.preventDefault();
      backdrop.style.display = "block";
      mostrarElemento(popUpContainer);
    });
  }

  if (abrirRegistroDesktop && popUpRegistro) {
    abrirRegistroDesktop.addEventListener("click", (e) => {
      e.preventDefault();
      backdrop.style.display = "block";
      mostrarElemento(popUpRegistro);
    });
  }

  // Click fuera del popup
  if (backdrop) {
    backdrop.addEventListener("click", () => {
      if (popUpContainer?.classList.contains("abrir")) ocultarElemento(popUpContainer);
      if (popUpRegistro?.classList.contains("abrir")) ocultarElemento(popUpRegistro);
    });
  }

  // Cerrar menú si se hace click fuera de él
  document.addEventListener("click", (e) => {
    const profileAvatar = document.getElementById("profile-avatar");
    const esClickDentroDelMenu =
      navMovil?.contains(e.target) ||
      hamburguesaMenu?.contains(e.target) ||
      profileAvatar?.contains(e.target);

    if (!esClickDentroDelMenu && navMovil?.classList.contains("visible")) {
      navMovil.classList.remove("visible");
      cerrarMenu?.classList.remove("visible");
      cerrarMenu?.classList.add("hidden");
      hamburguesaMenu?.classList.add("visible");
      hamburguesaMenu?.classList.remove("hidden");
    }
  });

  // REGISTRO DE USUARIO
  if (formRegistro) {
    formRegistro.addEventListener("submit", async function (e) {
      e.preventDefault();
      const nickname = document.getElementById("registro__name").value;
      const mail = document.getElementById("registro__email").value;
      const password = document.getElementById("login__password--registro").value;

      try {
        const resp = await fetch(`${API_URL}/api/usuarios/registro`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname, mail, password }),
        });

        const data = await resp.json();
        if (resp.ok) {
          alert("Usuario registrado correctamente");
          formRegistro.reset();
          ocultarElemento(popUpRegistro);
          backdrop.style.display = "none";

          // Auto-login
          const loginResp = await fetch(`${API_URL}/api/usuarios/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mail, password }),
          });

          const loginData = await loginResp.json();
          if (loginResp.ok) {
            localStorage.setItem("usuarioGG", JSON.stringify(loginData.user));
            if (window.actualizarMenuSegunSesion) window.actualizarMenuSegunSesion();
          }
        } else {
          alert(data.error || "Error al registrar usuario");
        }
      } catch {
        alert("Error al conectar con el servidor");
      }
    });
  }

  // LOGIN DE USUARIO
  if (formLogin) {
    formLogin.addEventListener("submit", async function (e) {
      e.preventDefault();
      const mail = document.getElementById("login__email").value;
      const password = document.getElementById("login__password").value;

      try {
        const resp = await fetch(`${API_URL}/api/usuarios/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mail, password }),
        });

        const data = await resp.json();
        if (resp.ok) {
          alert("Bienvenido, " + data.user.nickname + "!");
          formLogin.reset();
          ocultarElemento(popUpContainer);
          backdrop.style.display = "none";
          localStorage.setItem("usuarioGG", JSON.stringify(data.user));
          if (window.actualizarMenuSegunSesion) window.actualizarMenuSegunSesion();
        } else {
          alert(data.error || "Error al iniciar sesión");
        }
      } catch {
        alert("Error al conectar con el servidor");
      }
    });
  }
});