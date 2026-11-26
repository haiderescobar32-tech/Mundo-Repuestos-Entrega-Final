/* ==========================================
   MUNDO REPUESTOS - ADMINISTRACION VEHICULOS
   ========================================== */


/* 1. ALMACENAMIENTO --> AQUI HICE CONEXION CON SPRING BOOT */

const API_URL = "/api/vehiculos";

let vehiculosAdmin = [];

let vehiculoEditando = null;


/* 2. ELEMENTOS */

const formularioVehiculo = document.getElementById("form-vehiculo");

const tablaVehiculos = document.getElementById("tabla-vehiculos");

const buscadorVehiculos = document.getElementById("buscar-vehiculo");

const mensajeVehiculosVacios = document.getElementById("vehiculos-vacios");

const tituloFormularioVehiculo = document.getElementById("vehicle-form-title");

const botonGuardarVehiculo = document.querySelector(".vehicle-save-button");



/* 3. CONSULTAR VEHICULOS --> SPRING BOOT */

async function recuperarVehiculos() {

    try {

        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("Error al consultar vehículos");
        }

        const datos = await respuesta.json();

        vehiculosAdmin = datos.map(vehiculo => ({

            id: vehiculo.id_vehiculo,
            marca: vehiculo.marca || "",
            linea: vehiculo.linea || "",
            anio: vehiculo.modelo,
            motor: vehiculo.motor || "",
            cilindraje: vehiculo.cilindraje || "",
            combustible: vehiculo.combustible || "",
            transmision: ""

        }));

        console.log("Vehículos cargados desde MySQL:", vehiculosAdmin);

        mostrarVehiculos(buscadorVehiculos.value);

    } catch (error) {

        console.error("Error recuperando vehículos:", error);

        alert("No se pudieron consultar los vehículos.");

    }

}



/* 4. GUARDAR VEHICULOS */

function guardarVehiculos() {

    localStorage.setItem(
        CLAVE_VEHICULOS,
        JSON.stringify(vehiculosAdmin)
    );

}


/* 5. PROTEGER TEXTOS */

function escaparTextoVehiculo(texto) {

    return String(texto ?? "").replace(/[&<>"']/g, caracter => {

        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return caracteres[caracter];

    });

}


/* 6. ACTUALIZAR ESTADISTICAS */

function actualizarEstadisticasVehiculos() {

    const total = vehiculosAdmin.length;

    const marcas = new Set(
        vehiculosAdmin.map(v => v.marca.trim().toLowerCase())
    );

    const lineas = new Set(
        vehiculosAdmin.map(v =>
            `${v.marca.trim().toLowerCase()}|${v.linea.trim().toLowerCase()}`
        )
    );


    document.getElementById("total-vehiculos").textContent =
        total;

    document.getElementById("total-marcas").textContent =
        marcas.size;

    document.getElementById("total-modelos").textContent =
        lineas.size;

}


/* 7. MOSTRAR VEHICULOS */

function mostrarVehiculos(filtro = "") {

    const texto = filtro.trim().toLowerCase();

    const resultados = vehiculosAdmin.filter(vehiculo => {

        return (

            vehiculo.marca.toLowerCase().includes(texto) ||

            vehiculo.linea.toLowerCase().includes(texto) ||

            String(vehiculo.anio).includes(texto) ||

            vehiculo.motor.toLowerCase().includes(texto) ||

            vehiculo.combustible.toLowerCase().includes(texto) ||

            vehiculo.transmision.toLowerCase().includes(texto)

        );

    });


    document.getElementById("cantidad-vehiculos").textContent =
        `${vehiculosAdmin.length} vehículos`;


    actualizarEstadisticasVehiculos();


    if (vehiculosAdmin.length === 0) {

        tablaVehiculos.innerHTML = "";

        mensajeVehiculosVacios.style.display = "block";

        mensajeVehiculosVacios.querySelector("h3").textContent =
            "No hay vehículos registrados";

        mensajeVehiculosVacios.querySelector("p").textContent =
            "Registra tu primer vehículo utilizando el formulario.";

        return;

    }


    if (resultados.length === 0) {

        tablaVehiculos.innerHTML = `
            <tr>
                <td colspan="7">
                    No se encontraron vehículos con esa búsqueda.
                </td>
            </tr>
        `;

        mensajeVehiculosVacios.style.display = "none";

        return;

    }


    mensajeVehiculosVacios.style.display = "none";


    tablaVehiculos.innerHTML = resultados.map(vehiculo => `

        <tr>

            <td class="vehicle-brand-name">
                ${escaparTextoVehiculo(vehiculo.marca)}
            </td>

            <td class="vehicle-line-name">
                ${escaparTextoVehiculo(vehiculo.linea)}
            </td>

            <td>
                ${escaparTextoVehiculo(vehiculo.anio)}
            </td>

            <td>
                ${escaparTextoVehiculo(vehiculo.motor)}
            </td>

            <td>
                ${escaparTextoVehiculo(vehiculo.combustible)}
            </td>


            <td>

                <div class="vehicle-actions">

                    <button
                        type="button"
                        class="edit-vehicle"
                        data-action="edit"
                        data-id="${vehiculo.id}"
                        title="Editar vehículo">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        type="button"
                        class="delete-vehicle"
                        data-action="delete"
                        data-id="${vehiculo.id}"
                        title="Eliminar vehículo">

                        <i class="fa-solid fa-trash-can"></i>

                    </button>

                </div>

            </td>

        </tr>

    `).join("");

}


/* 8. LIMPIAR FORMULARIO */

function limpiarFormularioVehiculo() {

    formularioVehiculo.reset();

    vehiculoEditando = null;

    tituloFormularioVehiculo.innerHTML = `
        <i class="fa-solid fa-circle-plus"></i>
        Registrar nuevo vehículo
    `;

    botonGuardarVehiculo.innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        GUARDAR VEHÍCULO
    `;

}




/* 9. REGISTRAR O ACTUALIZAR VEHICULO --> SPRING BOOT */

formularioVehiculo.addEventListener("submit", async function(evento) {

    evento.preventDefault();

    const marca = document.getElementById("marca-vehiculo").value.trim();
    const linea = document.getElementById("linea-vehiculo").value.trim();
    const anio = Number(document.getElementById("anio-vehiculo").value);
    const motor = document.getElementById("motor-vehiculo").value.trim();
    const combustible = document.getElementById("combustible-vehiculo").value;
    const transmision = document.getElementById("transmision-vehiculo").value;

    if (
        !marca ||
        !linea ||
        !motor ||
        !combustible ||
        !transmision ||
        !Number.isInteger(anio) ||
        anio < 1950 ||
        anio > 2035
    ) {
        alert("Revisa los datos del vehículo.");
        return;
    }

    const duplicado = vehiculosAdmin.some(vehiculo =>
        vehiculo.marca.toLowerCase() === marca.toLowerCase() &&
        vehiculo.linea.toLowerCase() === linea.toLowerCase() &&
        Number(vehiculo.anio) === anio &&
        vehiculo.motor.toLowerCase() === motor.toLowerCase() &&
        vehiculo.id !== vehiculoEditando
    );

    if (duplicado) {
        alert("Este vehículo ya está registrado.");
        return;
    }

    const vehiculo = {
        marca: marca,
        linea: linea,
        modelo: anio,
        motor: motor,
        combustible: combustible
    };

    try {

        botonGuardarVehiculo.disabled = true;
        botonGuardarVehiculo.textContent = "Guardando...";

        const respuesta = await fetch(
            vehiculoEditando !== null
                ? `${API_URL}/${vehiculoEditando}`
                : API_URL,
            {
                method: vehiculoEditando !== null ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(vehiculo)
            }
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo guardar el vehículo.");
        }

        alert(vehiculoEditando !== null
            ? "Vehículo actualizado correctamente."
            : "Vehículo registrado correctamente."
        );

        limpiarFormularioVehiculo();

        await recuperarVehiculos();

    } catch (error) {

        console.error("Error guardando vehículo:", error);
        alert("No se pudo guardar el vehículo en MySQL.");

    } finally {

        botonGuardarVehiculo.disabled = false;

    }

});





/* 10. EDITAR Y ELIMINAR VEHICULOS --> SPRING BOOT */

tablaVehiculos.addEventListener("click", async function(evento) {

    const boton = evento.target.closest("[data-action]");

    if (!boton) return;

    const id = Number(boton.dataset.id);

    const vehiculo = vehiculosAdmin.find(
        item => Number(item.id) === id
    );

    if (!vehiculo) return;

    // EDITAR VEHICULO
    if (boton.dataset.action === "edit") {

        vehiculoEditando = id;

        document.getElementById("marca-vehiculo").value = vehiculo.marca;
        document.getElementById("linea-vehiculo").value = vehiculo.linea;
        document.getElementById("anio-vehiculo").value = vehiculo.anio;
        document.getElementById("motor-vehiculo").value = vehiculo.motor;
        document.getElementById("combustible-vehiculo").value = vehiculo.combustible;

        tituloFormularioVehiculo.innerHTML =
            '<i class="fa-solid fa-pen"></i> Editar vehículo';

        botonGuardarVehiculo.innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> ACTUALIZAR VEHÍCULO';

        formularioVehiculo.scrollIntoView({
            behavior: "smooth"
        });
    }

    // ELIMINAR VEHICULO
    if (boton.dataset.action === "delete") {

        const confirmar = confirm(
            `¿Deseas eliminar ${vehiculo.marca} ${vehiculo.linea} ${vehiculo.anio}?`
        );

        if (!confirmar) return;

        try {

            const respuesta = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            if (!respuesta.ok) {
                throw new Error("No se pudo eliminar el vehículo");
            }

            alert("Vehículo eliminado correctamente");

            if (vehiculoEditando === id) {
                limpiarFormularioVehiculo();
            }

            await recuperarVehiculos();

        } catch (error) {

            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar el vehículo");

        }
    }

});


/* 11. BUSCADOR */

buscadorVehiculos.addEventListener("input", function() {

    mostrarVehiculos(buscadorVehiculos.value);

});


/* 12. BOTON LIMPIAR */

document.getElementById("limpiar-vehiculo")
    .addEventListener("click", limpiarFormularioVehiculo);


/* 13. INICIAR MODULO */

recuperarVehiculos();


