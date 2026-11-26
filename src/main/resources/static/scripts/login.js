
const CLAVE_ADMIN = "1085912483";

const formulario = document.getElementById("login-form");
const campoPassword = document.getElementById("password-admin");
const mensajeError = document.getElementById("login-error");

formulario.addEventListener("submit", function(evento) {

    evento.preventDefault();

    if (campoPassword.value === CLAVE_ADMIN) {

        sessionStorage.setItem(
            "admin_autenticado_demo",
            "true"
        );

        window.location.href = "panel-principal.html";

    } else {

        mensajeError.textContent = "Contraseña incorrecta. Intenta nuevamente.";

        mensajeError.style.display = "block";

        campoPassword.value = "";
        campoPassword.focus();

    }

});


document.getElementById("mostrar-password")
    .addEventListener("click", function() {

        const visible = campoPassword.type === "text";

        campoPassword.type = visible ? "password" : "text";

        this.innerHTML = visible
            ? '<i class="fa-solid fa-eye"></i>'
            : '<i class="fa-solid fa-eye-slash"></i>';

    });
