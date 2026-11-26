/* ==========================================
   MUNDO REPUESTOS - CONTROL DE INVENTARIO
   ========================================== */



/* 1. CONSULTAR PRODUCTOS E INVENTARIO DESDE SPRING BOOT */

const API_PRODUCTOS = "/api/productos";
const API_INVENTARIO = "/api/inventario";

let productosInventario = [];

async function recuperarInventario() {

    try {

        const [respuestaProductos, respuestaInventario] =
            await Promise.all([
                fetch(API_PRODUCTOS),
                fetch(API_INVENTARIO)
            ]);

        if (!respuestaProductos.ok || !respuestaInventario.ok) {
            throw new Error("Error al consultar las tablas");
        }

        const productos = await respuestaProductos.json();
        const inventarios = await respuestaInventario.json();

        // Relacionar productos con sus registros de inventario
        productosInventario = productos.map(producto => {

            const registro = inventarios.find(
                item => Number(item.id_producto) === Number(producto.id)
            );

            return {
                id: producto.id,
                id_producto: producto.id,
                id_inventario: registro ? registro.id_inventario : null,

                nombre: producto.nombre_producto || "",
                marca: producto.marca || "",
                referencia: producto.referencia || "",
                categoria: producto.categoria || "",

                stock: registro ? Number(registro.stock_actual) || 0 : 0,
                stockMinimo: registro ? Number(registro.stock_minimo) || 0 : 1,

                ubicacion: registro ? registro.ubicacion || "" : "",

                vendidos: 0
            };

        });

        console.log("Productos e inventario cargados:", productosInventario);

        mostrarInventario();

    } catch (error) {

        console.error("Error recuperando inventario:", error);

        alert("No se pudo consultar el inventario desde Spring Boot.");

    }

}


/* 2. GUARDAR CAMBIOS */

function guardarInventario() {

    localStorage.setItem(
        CLAVE_INVENTARIO,
        JSON.stringify(productosInventario)
    );

}


/* 3. FORMATO DE PRECIOS */

function formatoPrecioInventario(precio) {

    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(precio);

}


/* 4. DETERMINAR ESTADO DEL PRODUCTO */

function obtenerEstadoInventario(producto) {

    if (producto.stock === 0) {

        return {
            nombre: "Agotado",
            clase: "empty"
        };

    }

    if (producto.stock <= producto.stockMinimo) {

        return {
            nombre: "Stock bajo",
            clase: "low"
        };

    }

    return {
        nombre: "Disponible",
        clase: "available"
    };

}


/* 5. ACTUALIZAR ESTADISTICAS */

function actualizarEstadisticasInventario() {

    const total = productosInventario.length;

    const disponibles = productosInventario.filter(producto =>
        obtenerEstadoInventario(producto).clase === "available"
    ).length;

    const bajos = productosInventario.filter(producto =>
        obtenerEstadoInventario(producto).clase === "low"
    ).length;

    const agotados = productosInventario.filter(producto =>
        obtenerEstadoInventario(producto).clase === "empty"
    ).length;

    const vendidos = productosInventario.reduce(
        (total, producto) => total + producto.vendidos,
        0
    );


    document.getElementById("inventario-total").textContent =
        total;

    document.getElementById("inventario-disponibles").textContent =
        disponibles;

    document.getElementById("inventario-bajo").textContent =
        bajos;

    document.getElementById("inventario-agotados").textContent =
        agotados;

    document.getElementById("inventario-vendidos").textContent =
        vendidos;

}


/* 6. MOSTRAR PRODUCTOS */

function mostrarInventario() {

    const tabla = document.getElementById("tabla-inventario");

    const mensajeVacio = document.getElementById("inventario-vacio");

    const busqueda = document.getElementById("buscar-inventario")
        .value.trim().toLowerCase();

    const filtro = document.getElementById("filtro-inventario").value;


    const resultados = productosInventario.filter(producto => {

        const coincideTexto =
            producto.nombre.toLowerCase().includes(busqueda) ||
            producto.marca.toLowerCase().includes(busqueda) ||
            producto.referencia.toLowerCase().includes(busqueda);

        const estado = obtenerEstadoInventario(producto);

        const coincideFiltro =
            filtro === "todos" ||
            (filtro === "disponibles" && estado.clase === "available") ||
            (filtro === "bajo" && estado.clase === "low") ||
            (filtro === "agotados" && estado.clase === "empty");

        return coincideTexto && coincideFiltro;

    });


    /* SIN PRODUCTOS REGISTRADOS */

    if (productosInventario.length === 0) {

        tabla.innerHTML = "";

        mensajeVacio.style.display = "block";

        mensajeVacio.querySelector("h3").textContent =
            "No hay productos registrados";

        mensajeVacio.querySelector("p").textContent =
            "Agrega tus primeros repuestos desde el módulo de productos.";

        actualizarEstadisticasInventario();

        return;

    }


    mensajeVacio.style.display = "none";


    /* SIN RESULTADOS DE BUSQUEDA */

    if (resultados.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="8">
                    No se encontraron productos con esos criterios.
                </td>
            </tr>
        `;

        actualizarEstadisticasInventario();

        return;

    }


    /* GENERAR FILAS */

    tabla.innerHTML = resultados.map(producto => {

        const estado = obtenerEstadoInventario(producto);

        const claseStock =
            estado.clase === "empty" ? "empty" :
            estado.clase === "low" ? "low" : "";

        return `

            <tr>

                <td>
                    <div class="inventory-product">
                        <strong>${escaparTexto(producto.nombre)}</strong>
                        <span>${escaparTexto(producto.categoria)}</span>
                    </div>
                </td>

                <td>
                    ${escaparTexto(producto.referencia)}
                </td>

                <td>
                    ${escaparTexto(producto.marca)}
                </td>

                <td class="inventory-quantity ${claseStock}">
                    ${producto.stock} unidades
                </td>

                <td>
                    ${producto.vendidos} unidades
                </td>

                <td>
                    ${producto.stockMinimo} unidades
                </td>

                <td>
                    <span class="inventory-status ${estado.clase}">
                        ${estado.nombre}
                    </span>
                </td>

                <td>

                    <div class="inventory-actions">

                        <button
                            type="button"
                            data-action="stock"
                            data-id="${producto.id}"
                            title="Actualizar existencias">

                            <i class="fa-solid fa-pen"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `;

    }).join("");


    actualizarEstadisticasInventario();

}


/* 7. PROTEGER TEXTOS */

function escaparTexto(texto) {

    return String(texto).replace(/[&<>"']/g, caracter => {

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



/* 8. ACTUALIZAR EXISTENCIAS DESDE SPRING BOOT */

document.getElementById("tabla-inventario")
    .addEventListener("click", async function(evento) {

        const boton = evento.target.closest("[data-action]");

        if (!boton) return;

        const id = Number(boton.dataset.id);

        const producto = productosInventario.find(
            item => Number(item.id) === id
        );

        if (!producto) return;

        const nuevaCantidad = prompt(
            `Producto: ${producto.nombre}\n\n` +
            `Existencias actuales: ${producto.stock}\n\n` +
            "Ingresa la nueva cantidad disponible:"
        );

        if (nuevaCantidad === null) return;

        if (
            nuevaCantidad.trim() === "" ||
            !/^\d+$/.test(nuevaCantidad.trim())
        ) {
            alert("Ingresa una cantidad entera válida.");
            return;
        }

        const cantidad = Number(nuevaCantidad);

        if (!Number.isSafeInteger(cantidad)) {
            alert("La cantidad ingresada no es válida.");
            return;
        }

        const inventario = {
            id_producto: producto.id_producto,
            stock_actual: cantidad,
            stock_minimo: producto.stockMinimo,
            ubicacion: producto.ubicacion
        };

        try {

            const respuesta = await fetch(
                producto.id_inventario
                    ? `${API_INVENTARIO}/${producto.id_inventario}`
                    : API_INVENTARIO,
                {
                    method: producto.id_inventario ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(inventario)
                }
            );

            if (!respuesta.ok) {
                throw new Error("No se pudieron actualizar las existencias");
            }

            await recuperarInventario();

            alert("¡Existencias actualizadas correctamente!");

        } catch (error) {

            console.error("Error actualizando inventario:", error);

            alert("No se pudieron guardar las existencias en MySQL.");

        }

    });


/* 9. BUSCADOR */

document.getElementById("buscar-inventario")
    .addEventListener("input", mostrarInventario);


/* 10. FILTROS */

document.getElementById("filtro-inventario")
    .addEventListener("change", mostrarInventario);


/* 11. INICIAR INVENTARIO */

recuperarInventario();

