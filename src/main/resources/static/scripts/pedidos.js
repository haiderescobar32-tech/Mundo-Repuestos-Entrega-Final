
/* ==========================================
   MUNDO REPUESTOS - ADMINISTRACION DE PEDIDOS
   ========================================== */


/* 1. RECUPERAR PEDIDOS */

const CLAVE_PEDIDOS = "pedidos_mundo_repuestos";

let pedidosAdmin = [];

function recuperarPedidos() {

    try {

        const datos = JSON.parse(
            localStorage.getItem(CLAVE_PEDIDOS) || "[]"
        );

        pedidosAdmin = Array.isArray(datos) ? datos : [];

    } catch (error) {

        console.error("Error recuperando pedidos:", error);

        pedidosAdmin = [];

    }

}


/* 2. GUARDAR PEDIDOS */

function guardarPedidos() {

    localStorage.setItem(
        CLAVE_PEDIDOS,
        JSON.stringify(pedidosAdmin)
    );

}


/* 3. FORMATO DE PRECIOS */

function formatoPrecioPedido(valor) {

    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(Number(valor) || 0);

}


/* 4. PROTEGER TEXTOS */

function escaparPedido(texto) {

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


/* 5. FORMATO DE FECHAS */

function formatoFechaPedido(fecha) {

    const fechaConvertida = new Date(fecha);

    if (Number.isNaN(fechaConvertida.getTime())) {
        return "Fecha no disponible";
    }

    return fechaConvertida.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });

}


/* 6. ESTADOS DE LOS PEDIDOS */

function obtenerEstadoPedido(estado) {

    const estados = {

        "Pendiente": "pending",
        "Confirmado": "confirmed",
        "En preparación": "preparing",
        "Enviado": "sent",
        "Entregado": "completed",
        "Cancelado": "cancelled"

    };

    return estados[estado] || "pending";

}


/* 7. ACTUALIZAR ESTADISTICAS */

function actualizarEstadisticasPedidos() {

    const total = pedidosAdmin.length;

    const pendientes = pedidosAdmin.filter(
        pedido => pedido.estado === "Pendiente"
    ).length;

    const proceso = pedidosAdmin.filter(
        pedido => [
            "Confirmado",
            "En preparación",
            "Enviado"
        ].includes(pedido.estado)
    ).length;

    const entregados = pedidosAdmin.filter(
        pedido => pedido.estado === "Entregado"
    ).length;


    document.getElementById("total-pedidos-admin").textContent =
        total;

    document.getElementById("pedidos-pendientes").textContent =
        pendientes;

    document.getElementById("pedidos-proceso").textContent =
        proceso;

    document.getElementById("pedidos-entregados").textContent =
        entregados;

}


/* 8. MOSTRAR PEDIDOS */

function mostrarPedidos() {

    const tabla = document.getElementById("tabla-pedidos");

    const mensajeVacio = document.getElementById("pedidos-vacios");

    const busqueda = document.getElementById("buscar-pedido")
        .value.trim().toLowerCase();

    const filtro = document.getElementById("filtro-estado").value;


    const resultados = pedidosAdmin.filter(pedido => {

        const cliente = pedido.cliente || {};

        const nombreCliente =
            `${cliente.nombres || ""} ${cliente.apellidos || ""}`
                .toLowerCase();

        const coincideBusqueda =

            String(pedido.id).toLowerCase().includes(busqueda) ||

            nombreCliente.includes(busqueda) ||

            String(cliente.telefono || "").includes(busqueda) ||

            String(cliente.correo || "").toLowerCase().includes(busqueda);


        const coincideEstado =
            filtro === "todos" || pedido.estado === filtro;


        return coincideBusqueda && coincideEstado;

    });


    document.getElementById("cantidad-pedidos").textContent =
        `${resultados.length} pedidos`;


    actualizarEstadisticasPedidos();


    if (resultados.length === 0) {

        tabla.innerHTML = "";

        mensajeVacio.style.display = "block";

        const titulo = mensajeVacio.querySelector("h3");

        const texto = mensajeVacio.querySelector("p");

        if (pedidosAdmin.length === 0) {

            titulo.textContent = "No hay pedidos registrados";

            texto.textContent =
                "Cuando tus clientes realicen compras aparecerán aquí.";

        } else {

            titulo.textContent = "No se encontraron resultados";

            texto.textContent =
                "Prueba con otro número de pedido o cliente.";

        }

        return;

    }


    mensajeVacio.style.display = "none";


    tabla.innerHTML = resultados.map(pedido => {

        const cliente = pedido.cliente || {};

        const nombreCliente =
            `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim();

        const estado = pedido.estado || "Pendiente";

        const claseEstado = obtenerEstadoPedido(estado);


        return `

            <tr>

                <td class="order-number">
                    ${escaparPedido(pedido.id)}
                </td>

                <td>
                    ${formatoFechaPedido(pedido.fecha)}
                </td>

                <td>

                    <div class="order-client">

                        <strong>
                            ${escaparPedido(nombreCliente || "Sin nombre")}
                        </strong>

                        <span>
                            ${escaparPedido(cliente.correo || "")}
                        </span>

                    </div>

                </td>

                <td>
                    ${escaparPedido(cliente.telefono || "No registrado")}
                </td>

                <td class="order-price">
                    ${formatoPrecioPedido(pedido.total)}
                </td>

                <td>
                    ${escaparPedido(pedido.metodoPago || "No registrado")}
                </td>

                <td>

                    <span class="order-status ${claseEstado}">
                        ${escaparPedido(estado)}
                    </span>

                </td>

                <td>

                    <div class="order-actions">

                        <button
                            type="button"
                            data-action="view"
                            data-id="${escaparPedido(pedido.id)}"
                            title="Ver detalle">

                            <i class="fa-solid fa-eye"></i>

                        </button>

                    </div>

                </td>

            </tr>

        `;

    }).join("");

}


/* 9. ABRIR DETALLE DEL PEDIDO */

function abrirDetallePedido(id) {

    const pedido = pedidosAdmin.find(
        item => String(item.id) === String(id)
    );

    if (!pedido) return;

    const cliente = pedido.cliente || {};

    const entrega = pedido.entrega || {};

    const productos = Array.isArray(pedido.productos)
        ? pedido.productos
        : [];

    const estadoActual = pedido.estado || "Pendiente";


    const productosHTML = productos.map(producto => `

        <div class="order-detail-product">

            <div>

                <strong>${escaparPedido(producto.nombre)}</strong>

                <p>
                    ${escaparPedido(producto.marca || "Sin marca")}
                    · Cantidad: ${Number(producto.cantidad) || 0}
                </p>

            </div>

            <strong>
                ${formatoPrecioPedido(
                    Number(producto.precio) *
                    Number(producto.cantidad)
                )}
            </strong>

        </div>

    `).join("");


    const contenido = document.getElementById(
        "detalle-pedido-contenido"
    );


    contenido.innerHTML = `

        <div class="order-detail-section">

            <h3>Información del pedido</h3>

            <p>
                <strong>Número:</strong>
                ${escaparPedido(pedido.id)}
            </p>

            <p>
                <strong>Fecha:</strong>
                ${formatoFechaPedido(pedido.fecha)}
            </p>

            <p>
                <strong>Estado:</strong>
                ${escaparPedido(estadoActual)}
            </p>

            <p>
                <strong>Método de pago:</strong>
                ${escaparPedido(pedido.metodoPago)}
            </p>

        </div>


        <div class="order-detail-section">

            <h3>Datos del cliente</h3>

            <p>
                <strong>Nombre:</strong>
                ${escaparPedido(cliente.nombres)}
                ${escaparPedido(cliente.apellidos)}
            </p>

            <p>
                <strong>Documento:</strong>
                ${escaparPedido(cliente.tipoDocumento)}
                ${escaparPedido(cliente.documento)}
            </p>

            <p>
                <strong>Teléfono:</strong>
                ${escaparPedido(cliente.telefono)}
            </p>

            <p>
                <strong>Correo:</strong>
                ${escaparPedido(cliente.correo)}
            </p>

        </div>


        <div class="order-detail-section">

            <h3>Dirección de entrega</h3>

            <p>
                ${escaparPedido(entrega.direccion)}
            </p>

            <p>
                ${escaparPedido(entrega.ciudad)},
                ${escaparPedido(entrega.departamento)}
            </p>

            <p>
                ${escaparPedido(entrega.indicaciones || "Sin indicaciones adicionales")}
            </p>

        </div>


        <div class="order-detail-section">

            <h3>Productos comprados</h3>

            <div class="order-detail-products">

                ${productosHTML || "Sin productos registrados."}

            </div>

        </div>


        <div class="order-detail-section">

            <h3>Resumen económico</h3>

            <p>
                <strong>Subtotal:</strong>
                ${formatoPrecioPedido(pedido.subtotal)}
            </p>

            <p>
                <strong>Envío:</strong>
                ${pedido.envio === null || pedido.envio === undefined
                    ? "Por calcular"
                    : formatoPrecioPedido(pedido.envio)}
            </p>

            <p>
                <strong>Total:</strong>
                ${formatoPrecioPedido(pedido.total)}
            </p>

        </div>


        <div class="order-detail-section">

            <h3>Actualizar estado del pedido</h3>

            <select id="nuevo-estado-pedido">

                <option value="Pendiente">Pendiente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="En preparación">En preparación</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>

            </select>

            <button
                type="button"
                class="save-order-status"
                data-action="save-status"
                data-id="${escaparPedido(pedido.id)}">

                <i class="fa-solid fa-floppy-disk"></i>
                Guardar estado

            </button>

        </div>

    `;


    document.getElementById("nuevo-estado-pedido").value =
        estadoActual;

    document.getElementById("modal-pedido").hidden = false;

}


/* 10. CONSULTAR DETALLE */

document.getElementById("tabla-pedidos")
    .addEventListener("click", function(evento) {

        const boton = evento.target.closest("[data-action]");

        if (!boton || boton.dataset.action !== "view") return;

        abrirDetallePedido(boton.dataset.id);

    });


/* 11. GUARDAR NUEVO ESTADO */

document.getElementById("detalle-pedido-contenido")
    .addEventListener("click", function(evento) {

        const boton = evento.target.closest(
            '[data-action="save-status"]'
        );

        if (!boton) return;

        const pedido = pedidosAdmin.find(
            item => String(item.id) === String(boton.dataset.id)
        );

        if (!pedido) return;

        const nuevoEstado = document.getElementById(
            "nuevo-estado-pedido"
        ).value;


        pedido.estado = nuevoEstado;

        guardarPedidos();

        mostrarPedidos();

        abrirDetallePedido(pedido.id);

        alert("¡Estado del pedido actualizado correctamente!");

    });


/* 12. CERRAR MODAL */

function cerrarDetallePedido() {

    document.getElementById("modal-pedido").hidden = true;

}


document.getElementById("cerrar-modal")
    .addEventListener("click", cerrarDetallePedido);


document.getElementById("modal-pedido")
    .addEventListener("click", function(evento) {

        if (evento.target === this) {
            cerrarDetallePedido();
        }

    });


document.addEventListener("keydown", function(evento) {

    if (evento.key === "Escape") {
        cerrarDetallePedido();
    }

});


/* 13. BUSCADOR */

document.getElementById("buscar-pedido")
    .addEventListener("input", mostrarPedidos);


/* 14. FILTRO POR ESTADO */

document.getElementById("filtro-estado")
    .addEventListener("change", mostrarPedidos);


/* 15. INICIAR ADMINISTRACION */

recuperarPedidos();

mostrarPedidos();
