
/* ==========================================
   MUNDO REPUESTOS - GESTION COMPATIBILIDAD
   CONEXION CON SPRING BOOT Y MYSQL
   ========================================== */


/* 1. DIRECCIONES DE LAS API */

const API_PRODUCTOS_COMPAT = "/api/productos";
const API_VEHICULOS_COMPAT = "/api/vehiculos";
const API_COMPATIBILIDAD = "/api/compatibilidad";


/* 2. VARIABLES PRINCIPALES */

let productosCompat = [];
let vehiculosCompat = [];
let relacionesCompat = [];


/* 3. ELEMENTOS DEL HTML */

const selectorProducto = document.getElementById(
    "seleccionar-producto"
);

const selectorVehiculos = document.getElementById(
    "seleccionar-vehiculos"
);

const tablaCompatibilidad = document.getElementById(
    "tabla-compatibilidad"
);

const buscadorCompatibilidad = document.getElementById(
    "buscar-compatibilidad"
);

const botonGuardarCompat = document.getElementById(
    "guardar-compatibilidad"
);

const botonLimpiarCompat = document.getElementById(
    "limpiar-compatibilidad"
);

const mensajeCompatVacio = document.getElementById(
    "compat-vacio"
);

// Nuevo campo para escribir las observaciones
const campoObservaciones = document.getElementById(
    "observaciones-compatibilidad"
);


/* 4. PROTEGER TEXTOS */

function escaparCompat(texto) {

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


/* 5. CONSULTAR DATOS DESDE MYSQL */

async function recuperarDatosCompatibilidad() {

    try {

        // Consultamos productos, vehículos y compatibilidades
        const [
            respuestaProductos,
            respuestaVehiculos,
            respuestaCompat
        ] = await Promise.all([

            fetch(API_PRODUCTOS_COMPAT),
            fetch(API_VEHICULOS_COMPAT),
            fetch(API_COMPATIBILIDAD)

        ]);

        if (
            !respuestaProductos.ok ||
            !respuestaVehiculos.ok ||
            !respuestaCompat.ok
        ) {

            throw new Error("No se pudieron consultar las API.");

        }

        // Convertimos las respuestas a JSON
        productosCompat = await respuestaProductos.json();

        vehiculosCompat = await respuestaVehiculos.json();

        relacionesCompat = await respuestaCompat.json();

        // Actualizamos los componentes de la página
        cargarProductosCompat();

        cargarVehiculosCompat();

        mostrarTablaCompatibilidad();

        actualizarEstadisticasCompat();

        console.log("Productos cargados:", productosCompat);

        console.log("Vehículos cargados:", vehiculosCompat);

        console.log("Compatibilidades cargadas:", relacionesCompat);

    } catch (error) {

        console.error("Error recuperando compatibilidades:", error);

        alert("No se pudieron cargar los datos desde MySQL.");

    }

}


/* 6. OBTENER NOMBRE DEL VEHICULO */

function nombreCompletoVehiculo(vehiculo) {

    return `${vehiculo.marca} ${vehiculo.linea} ${vehiculo.modelo} · ${vehiculo.motor}`;

}


/* 7. OBTENER VEHICULOS COMPATIBLES */

function obtenerCompatiblesProducto(producto) {

    // Buscamos las relaciones correspondientes al producto
    const relaciones = relacionesCompat.filter(relacion =>
        Number(relacion.id_producto) === Number(producto.id)
    );

    // Recuperamos los nombres de los vehículos relacionados
    return relaciones.map(relacion => {

        const vehiculo = vehiculosCompat.find(item =>
            Number(item.id_vehiculo) === Number(relacion.id_vehiculo)
        );

        return vehiculo
            ? nombreCompletoVehiculo(vehiculo)
            : `Vehículo ID ${relacion.id_vehiculo}`;

    });

}


/* 8. ACTUALIZAR ESTADISTICAS */

function actualizarEstadisticasCompat() {

    document.getElementById("compat-total-productos").textContent =
        productosCompat.length;

    document.getElementById("compat-total-vehiculos").textContent =
        vehiculosCompat.length;

    document.getElementById("compat-total-relaciones").textContent =
        relacionesCompat.length;

}


/* 9. CARGAR SELECTOR DE PRODUCTOS */

function cargarProductosCompat() {

    selectorProducto.innerHTML = `
        <option value="">Selecciona un producto</option>
    `;

    productosCompat.forEach(producto => {

        const opcion = document.createElement("option");

        opcion.value = producto.id;

        opcion.textContent =
            `${producto.nombre_producto} · Ref. ${producto.referencia}`;

        selectorProducto.appendChild(opcion);

    });

    selectorProducto.disabled = productosCompat.length === 0;

}


/* 10. CARGAR SELECTOR DE VEHICULOS */

function cargarVehiculosCompat() {

    selectorVehiculos.innerHTML = "";

    if (vehiculosCompat.length === 0) {

        const opcion = document.createElement("option");

        opcion.textContent = "Primero registra vehículos";

        opcion.disabled = true;

        selectorVehiculos.appendChild(opcion);

        selectorVehiculos.disabled = true;

        return;

    }

    selectorVehiculos.disabled = false;

    vehiculosCompat.forEach(vehiculo => {

        const opcion = document.createElement("option");

        opcion.value = vehiculo.id_vehiculo;

        opcion.textContent = nombreCompletoVehiculo(vehiculo);

        selectorVehiculos.appendChild(opcion);

    });

}


/* 11. SELECCIONAR PRODUCTO */

function seleccionarProductoCompat(id) {

    selectorProducto.value = String(id);

    seleccionarProductoSinDesplazamiento(id);

    document.querySelector(".compat-editor").scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/* 12. MOSTRAR TABLA DE COMPATIBILIDAD */

function mostrarTablaCompatibilidad(filtro = "") {

    const texto = filtro.trim().toLowerCase();

    // Filtramos por nombre, referencia o marca
    const resultados = productosCompat.filter(producto => {

        return (

            String(producto.nombre_producto).toLowerCase().includes(texto) ||

            String(producto.referencia).toLowerCase().includes(texto) ||

            String(producto.marca).toLowerCase().includes(texto)

        );

    });

    document.getElementById("compat-contador").textContent =
        `${resultados.length} productos`;

    actualizarEstadisticasCompat();

    if (productosCompat.length === 0) {

        tablaCompatibilidad.innerHTML = "";

        mensajeCompatVacio.style.display = "block";

        mensajeCompatVacio.querySelector("h3").textContent =
            "No hay productos registrados";

        return;

    }

    if (resultados.length === 0) {

        tablaCompatibilidad.innerHTML = `
            <tr>
                <td colspan="6">No se encontraron productos.</td>
            </tr>
        `;

        mensajeCompatVacio.style.display = "none";

        return;

    }

    mensajeCompatVacio.style.display = "none";

    tablaCompatibilidad.innerHTML = resultados.map(producto => {

        // Recuperamos las relaciones del producto
        const relaciones = relacionesCompat.filter(relacion =>
            Number(relacion.id_producto) === Number(producto.id)
        );

        const compatibles = obtenerCompatiblesProducto(producto);

        // Mostramos los vehículos compatibles
        const etiquetas = compatibles.length > 0

            ? compatibles.map(nombre => `

                <span class="compat-vehicle-tag">
                    ${escaparCompat(nombre)}
                </span>

            `).join("")

            : `<span style="color:#8993a0">Sin vehículos asociados</span>`;

        // Mostramos las observaciones guardadas en MySQL
        const observaciones = relaciones.length > 0

            ? relaciones.map(relacion => `
                <span class="compat-observation">
                    ${escaparCompat(relacion.observaciones || "Sin observaciones")}
                </span>
            `).join("<br>")

            : `<span style="color:#8993a0">Sin observaciones</span>`;

        return `

            <tr>

                <td class="compat-product-name">
                    ${escaparCompat(producto.nombre_producto)}
                </td>

                <td>
                    ${escaparCompat(producto.referencia)}
                </td>

                <td>
                    ${escaparCompat(producto.marca)}
                </td>

                <td>
                    ${etiquetas}
                </td>

                <td>
                    ${observaciones}
                </td>

                <td>

                    <div class="compat-actions-table">

                        <button
                            type="button"
                            data-action="edit"
                            data-id="${producto.id}"
                            title="Administrar compatibilidad">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `;

    }).join("");

}


/* 13. SELECCIONAR LAS RELACIONES EXISTENTES */

function seleccionarProductoSinDesplazamiento(id) {

    // Buscamos las relaciones actuales del producto
    const relaciones = relacionesCompat.filter(relacion =>
        Number(relacion.id_producto) === Number(id)
    );

    const idsVehiculos = relaciones.map(relacion =>
        Number(relacion.id_vehiculo)
    );

    // Marcamos los vehículos que ya están relacionados
    [...selectorVehiculos.options].forEach(opcion => {

        opcion.selected = idsVehiculos.includes(
            Number(opcion.value)
        );

    });

    // Recuperamos las observaciones existentes
    const observaciones = [
        ...new Set(
            relaciones.map(relacion => relacion.observaciones || "")
        )
    ];

    // Si todas comparten la misma observación, la mostramos
    if (observaciones.length === 1) {

        campoObservaciones.value = observaciones[0];

    } else {

        // Si son diferentes, dejamos el campo vacío
        campoObservaciones.value = "";

    }

    botonGuardarCompat.disabled = false;

}


/* 14. CAMBIAR PRODUCTO SELECCIONADO */

selectorProducto.addEventListener("change", function() {

    if (!this.value) {

        [...selectorVehiculos.options].forEach(opcion => {

            opcion.selected = false;

        });

        campoObservaciones.value = "";

        botonGuardarCompat.disabled = true;

        return;

    }

    seleccionarProductoSinDesplazamiento(this.value);

});


/* 15. GUARDAR COMPATIBILIDAD EN MYSQL */

botonGuardarCompat.addEventListener("click", async function() {

    const idProducto = Number(selectorProducto.value);

    if (!idProducto) {

        alert("Selecciona un producto.");

        return;

    }

    // Recuperamos los vehículos seleccionados
    const idsSeleccionados = [
        ...selectorVehiculos.selectedOptions
    ].map(opcion => Number(opcion.value));

    // Eliminamos posibles IDs repetidos
    const idsUnicos = [...new Set(idsSeleccionados)];

    // Recuperamos las relaciones actuales del producto
    const relacionesActuales = relacionesCompat.filter(relacion =>
        Number(relacion.id_producto) === idProducto
    );

    // Identificamos las relaciones que se deben eliminar
    const relacionesEliminar = relacionesActuales.filter(relacion =>
        !idsUnicos.includes(Number(relacion.id_vehiculo))
    );

    // Identificamos los vehículos que todavía no están relacionados
    const idsExistentes = relacionesActuales.map(relacion =>
        Number(relacion.id_vehiculo)
    );

    const idsNuevos = idsUnicos.filter(id =>
        !idsExistentes.includes(id)
    );

    // Leemos la observación escrita en el formulario
    const observacion = campoObservaciones.value.trim();

    if (observacion.length > 200) {

        alert("Las observaciones no pueden superar 200 caracteres.");

        return;

    }

    // Desactivamos el botón mientras guardamos
    botonGuardarCompat.disabled = true;

    const textoOriginal = botonGuardarCompat.innerHTML;

    botonGuardarCompat.textContent = "Guardando...";

    try {

        /* 15.1. REGISTRAR NUEVAS RELACIONES */

        // Creamos un registro para cada vehículo nuevo
        for (const idVehiculo of idsNuevos) {

            const respuesta = await fetch(API_COMPATIBILIDAD, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    id_producto: idProducto,

                    id_vehiculo: idVehiculo,

                    observaciones: observacion

                })

            });

            if (!respuesta.ok) {

                throw new Error("No se pudo registrar una compatibilidad.");

            }

        }


        /* 15.2. ACTUALIZAR RELACIONES EXISTENTES */

        // Actualizamos las observaciones de los vehículos seleccionados
        for (const relacion of relacionesActuales) {

            const sigueSeleccionado = idsUnicos.includes(
                Number(relacion.id_vehiculo)
            );

            if (!sigueSeleccionado) continue;

            const respuesta = await fetch(
                `${API_COMPATIBILIDAD}/${relacion.id_compatibilidad}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        id_producto: idProducto,

                        id_vehiculo: Number(relacion.id_vehiculo),

                        observaciones: observacion

                    })

                }
            );

            if (!respuesta.ok) {

                throw new Error("No se pudo actualizar la observación.");

            }

        }


        /* 15.3. ELIMINAR RELACIONES DESELECCIONADAS */

        // Eliminamos las relaciones que fueron desmarcadas
        for (const relacion of relacionesEliminar) {

            const respuesta = await fetch(
                `${API_COMPATIBILIDAD}/${relacion.id_compatibilidad}`,
                {
                    method: "DELETE"
                }
            );

            if (!respuesta.ok) {

                throw new Error("No se pudo eliminar una compatibilidad.");

            }

        }


        /* 15.4. RECUPERAR LOS DATOS ACTUALIZADOS */

        // Consultamos nuevamente las relaciones en MySQL
        const respuestaActualizada = await fetch(API_COMPATIBILIDAD);

        if (!respuestaActualizada.ok) {

            throw new Error("No se pudieron actualizar las relaciones.");

        }

        relacionesCompat = await respuestaActualizada.json();

        // Actualizamos la tabla y las estadísticas
        mostrarTablaCompatibilidad(buscadorCompatibilidad.value);

        alert("¡Compatibilidades y observaciones guardadas correctamente en MySQL!");

    } catch (error) {

        console.error("Error guardando compatibilidad:", error);

        alert(
            "No se pudieron guardar todas las compatibilidades. " +
            "Revisa la consola y vuelve a consultar los datos."
        );

        // Recuperamos las relaciones reales desde MySQL
        try {

            const respuesta = await fetch(API_COMPATIBILIDAD);

            if (respuesta.ok) {

                relacionesCompat = await respuesta.json();

                mostrarTablaCompatibilidad(buscadorCompatibilidad.value);

            }

        } catch (errorRecuperacion) {

            console.error("Error recuperando relaciones:", errorRecuperacion);

        }

    } finally {

        // Reactivamos el botón después de terminar
        botonGuardarCompat.disabled = false;

        botonGuardarCompat.innerHTML = textoOriginal;

    }

});


/* 16. LIMPIAR SELECCION */

botonLimpiarCompat.addEventListener("click", function() {

    selectorProducto.value = "";

    [...selectorVehiculos.options].forEach(opcion => {

        opcion.selected = false;

    });

    // También limpiamos el campo de observaciones
    campoObservaciones.value = "";

    botonGuardarCompat.disabled = true;

});


/* 17. EDITAR DESDE LA TABLA */

tablaCompatibilidad.addEventListener("click", function(evento) {

    const boton = evento.target.closest('[data-action="edit"]');

    if (!boton) return;

    seleccionarProductoCompat(boton.dataset.id);

});


/* 18. BUSCADOR */

buscadorCompatibilidad.addEventListener("input", function() {

    mostrarTablaCompatibilidad(this.value);

});


/* 19. INICIAR MODULO */

recuperarDatosCompatibilidad();
