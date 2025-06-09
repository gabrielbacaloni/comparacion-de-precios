document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("form-reset");
  const input = document.getElementById("nueva-password");
  const errorMsg = document.getElementById("error-token");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  // Validación inicial del token
  if (!token) {
    form.style.display = "none";
    errorMsg.textContent = "Token inválido.";
    errorMsg.style.display = "block";
    return;
  }

  // Verificar con el backend si el token sigue siendo válido (petición vacía)
  try {
    const resp = await fetch(`${API_URL}/api/usuarios/resetear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, nuevaPassword: "___dummy" }) // fuerza el error de expirado sin guardar
    });

    if (!resp.ok) {
      const data = await resp.json();
      form.style.display = "none";
      errorMsg.textContent = data.error || "El enlace expiró.";
      errorMsg.style.display = "block";
    }
  } catch {
    form.style.display = "none";
    errorMsg.textContent = "No se pudo verificar el token.";
    errorMsg.style.display = "block";
  }

  // Re-habilitamos el form (en caso de token válido)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nuevaPassword = input.value.trim();

    if (nuevaPassword.length < 8) {
      errorMsg.textContent = "La contraseña debe tener al menos 8 caracteres.";
      errorMsg.style.display = "block";
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/api/usuarios/resetear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nuevaPassword }),
      });

      const data = await resp.json();

      if (resp.ok) {
        alert(data.message);
        window.location.href = "index.html";
      } else {
        form.style.display = "none";
        errorMsg.textContent = data.error || "El enlace no es válido.";
        errorMsg.style.display = "block";
      }

    } catch {
      errorMsg.textContent = "Error al contactar el servidor";
      errorMsg.style.display = "block";
    }
  });
});

