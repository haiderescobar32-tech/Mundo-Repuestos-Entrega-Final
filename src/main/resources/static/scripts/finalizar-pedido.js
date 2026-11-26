/* ==========================================
   MUNDO REPUESTOS - FINALIZAR PEDIDO
   CONEXION CON SPRING BOOT Y MYSQL
   ========================================== */


/* 1. RECUPERAR CARRITO */

// Recuperamos temporalmente los productos seleccionados
let carritoCheckout = JSON.parse(
    localStorage.getItem("carrito_mundo_repuestos") || "[]"
);


/* 2. FORMATO DE PRECIOS */

function formatoPrecioCheckout(precio) {

    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(precio);

}


/* 3. CALCULAR SUBTOTAL */

function calcularSubtotalCheckout() {

    return carritoCheckout.reduce((total, producto) => {

        return total +
            (Number(producto.precio) * Number(producto.cantidad));

    }, 0);

}


/* 4. MOSTRAR PRODUCTOS */

function mostrarProductosCheckout() {

    const contenedor = document.getElementById(
        "checkout-products"
    );

    if (!contenedor) return;

    if (carritoCheckout.length === 0) {

        contenedor.innerHTML = `
            <div class="checkout-product-info">
                <strong>Tu carrito está vacío</strong>
                <span>Agrega productos antes de continuar.</span>
            </div>
            <a href="catalogo.html" class="continue-shopping">
                Explorar catálogo
            </a>
        `;

        return;

    }

    contenedor.innerHTML = carritoCheckout.map(producto => `

        <div class="checkout-product">

            <div class="checkout-product-info">

                <strong>${producto.nombre}</strong>

                <span>
                    ${producto.marca || "Sin marca"}
                    · Cantidad: ${producto.cantidad}
                </span>

            </div>

            <div class="checkout-product-price">

                ${formatoPrecioCheckout(
                    producto.precio * producto.cantidad
                )}

            </div>

        </div>

    `).join("");

}


/* 5. ACTUALIZAR RESUMEN */

function actualizarResumenCheckout() {

    const subtotal = calcularSubtotalCheckout();

    document.getElementById("checkout-subtotal").textContent =
        formatoPrecioCheckout(subtotal);

    document.getElementById("checkout-shipping").textContent =
        "Por calcular";

    document.getElementById("checkout-total").textContent =
        formatoPrecioCheckout(subtotal);

    const boton = document.getElementById("confirm-order");

    if (carritoCheckout.length === 0) {

        boton.disabled = true;

    } else {

        boton.disabled = false;

    }

}


/* 6. ACTUALIZAR CONTADOR DEL CARRITO */

function actualizarContadorCheckout() {

    const contador = document.querySelector(".cart-count");

    if (!contador) return;

    const cantidad = carritoCheckout.reduce(
        (total, producto) => total + Number(producto.cantidad),
        0
    );

    contador.textContent = cantidad;

}


/* ==========================================
   7. BUSCAR O REGISTRAR PERSONA EN MYSQL
   ========================================== */

async function obtenerOCrearPersona(datos) {

    const documento = datos.get("documento").trim();

    // Consultamos si el cliente ya está registrado
    const consulta = await fetch(
        `/api/personas/documento/${encodeURIComponent(documento)}`
    );

    if (!consulta.ok) {
        throw new Error("No se pudo consultar la persona.");
    }

    // Convertimos la respuesta del servidor a JSON
    const textoRespuesta = await consulta.text();

    const personaExistente = textoRespuesta.trim()
        ? JSON.parse(textoRespuesta)
        : null;

    console.log("Persona encontrada:", personaExistente);

    // Si existe, recuperamos su identificador
    if (personaExistente !== null) {
        return personaExistente;
    }

    // Si no existe, preparamos sus datos para registrarla
    const persona = {

        nombres: datos.get("nombre").trim(),
        apellidos: datos.get("apellidos").trim(),
        tipo_documento: datos.get("tipo_documento"),
        numero_documento: documento,
        telefono: datos.get("telefono"),
        correo: datos.get("correo"),
        direccion: datos.get("direccion"),
        tipo_persona: "CLIENTE",
        estado: "ACTIVO"

    };

    // Enviamos los datos a Spring Boot mediante POST
    const respuesta = await fetch("/api/personas", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(persona)

    });

    if (!respuesta.ok) {
        throw new Error("No se pudo registrar la persona.");
    }

    // Recuperamos la persona registrada y su ID
    return await respuesta.json();

}


/* ==========================================
   8. VALIDAR Y REGISTRAR PEDIDO
   ========================================== */

const formulario = document.getElementById("checkout-form");

formulario.addEventListener("submit", async function(event) {

    // Evitamos que el formulario se envíe de manera tradicional
    event.preventDefault();

    if (carritoCheckout.length === 0) {

        alert("No tienes productos en tu carrito.");

        return;

    }

    // Validamos los campos obligatorios del formulario
    if (!formulario.reportValidity()) return;

    const datos = new FormData(formulario);

    const metodoPago = datos.get("metodo_pago");

    if (!metodoPago) {

        alert("Selecciona un método de pago.");

        return;

    }

    // Evitamos registrar dos compras por doble clic
    const botonConfirmar = document.getElementById("confirm-order");

    if (botonConfirmar.disabled) return;

    botonConfirmar.disabled = true;
    botonConfirmar.textContent = "Procesando pedido...";

    try {

        /* ==========================================
           8.1. BUSCAR O REGISTRAR PERSONA
           ========================================== */

        // Recuperamos el cliente y su identificador MySQL
        const persona = await obtenerOCrearPersona(datos);

        console.log("Persona registrada o encontrada:", persona);


        /* ==========================================
           8.2. GENERAR NUMERO DE PEDIDO
           ========================================== */

        const numeroPedido =
            "PED-" + Date.now().toString().slice(-8);


        /* ==========================================
           8.3. PREPARAR INFORMACION DEL PEDIDO
           ========================================== */

        const subtotal = calcularSubtotalCheckout();

        // Organizamos los datos según las columnas de MySQL
        const pedidoMySQL = {

            numero_pedido: numeroPedido,

            // Relacionamos la compra con la persona
            id_persona: persona.id_persona,

            // Combinamos la dirección de entrega
            direccion_entrega:
                `${datos.get("direccion")}, ${datos.get("ciudad")}, ${datos.get("departamento")}`,

            metodo_pago: metodoPago,

            estado_pedido: "PENDIENTE",

            total: subtotal

        };


        /* ==========================================
           8.4. REGISTRAR PEDIDO MEDIANTE POST
           ========================================== */

        // Enviamos el pedido principal a Spring Boot
        const respuestaPedido = await fetch("/api/pedidos", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(pedidoMySQL)

        });

        if (!respuestaPedido.ok) {
            throw new Error("No se pudo registrar el pedido en MySQL.");
        }

        // Recuperamos el pedido y su ID generado por MySQL
        const pedidoGuardado = await respuestaPedido.json();

        console.log("Pedido guardado en MySQL:", pedidoGuardado);

        if (!pedidoGuardado.id_pedido) {
            throw new Error("No se recibió el identificador del pedido.");
        }


        /* ==========================================
           8.5. PREPARAR DETALLE DE LOS PRODUCTOS
           ========================================== */

        // Recorremos los productos que contiene el carrito
        const detallesPedido = carritoCheckout.map(producto => ({

            // Relacionamos cada producto con el pedido creado
            id_pedido: pedidoGuardado.id_pedido,

            // Identificamos el producto de MySQL
            id_producto: Number(producto.id),

            // Cantidad de unidades compradas
            cantidad: Number(producto.cantidad),

            // Precio individual del producto
            precio_unitario: Number(producto.precio),

            // Calculamos el subtotal de cada producto
            subtotal:
                Number(producto.precio) * Number(producto.cantidad)

        }));


        /* ==========================================
           8.6. REGISTRAR DETALLES MEDIANTE POST
           ========================================== */

        // Enviamos cada producto a la tabla detalle_pedidos
        const respuestasDetalles = await Promise.all(

            detallesPedido.map(detalle =>

                fetch("/api/detalle-pedidos", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(detalle)

                })

            )

        );

        // Verificamos que todos los productos se hayan guardado
        if (respuestasDetalles.some(respuesta => !respuesta.ok)) {

            throw new Error(
                "No se pudieron registrar todos los productos del pedido."
            );

        }

        console.log("Detalles guardados en MySQL:", detallesPedido);


        /* ==========================================
           8.7. LIMPIAR CARRITO DESPUES DE GUARDAR
           ========================================== */

        // Eliminamos el carrito solamente cuando todo fue exitoso
        localStorage.removeItem("carrito_mundo_repuestos");

        carritoCheckout = [];

        // Actualizamos el contador visual del carrito
        const contador = document.querySelector(".cart-count");

        if (contador) {
            contador.textContent = "0";
        }


        /* ==========================================
           8.8. MOSTRAR CONFIRMACION FINAL
           ========================================== */

        const confirmacion = document.createElement("div");

        confirmacion.className = "checkout-confirmation";

        // Mostramos el número real del pedido registrado
        confirmacion.innerHTML = `

            <div class="confirmation-icon">
                <i class="fa-solid fa-circle-check"></i>
            </div>

            <h2>¡Pedido registrado correctamente!</h2>

            <p>Tu número de pedido es:</p>

            <strong>${pedidoGuardado.numero_pedido}</strong>

            <p>
                Método de pago seleccionado: ${metodoPago}
            </p>

            <p class="confirmation-note">

                Tu pedido fue registrado correctamente
                en nuestro sistema. Gracias por comprar
                en Mundo Repuestos.

            </p>

            <a href="catalogo.html" class="btn-primary">
                Seguir comprando
            </a>

        `;

        formulario.replaceWith(confirmacion);

        // Llevamos al usuario al mensaje de confirmación
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        console.log("Compra completada correctamente en MySQL.");

    } catch (error) {

        // Mostramos el error para facilitar su identificación
        console.error("Error procesando la compra:", error);

        alert(
            "No se pudo completar el registro de la compra. " +
            "El carrito se conservará para que puedas revisar el problema."
        );

        // Permitimos volver a intentar después de revisar el error
        botonConfirmar.disabled = false;
        botonConfirmar.textContent = "CONFIRMAR PEDIDO";

    }

});


/* ==========================================
   9. INICIAR PANTALLA
   ========================================== */

document.addEventListener("DOMContentLoaded", function() {

    // Mostramos los productos del carrito
    mostrarProductosCheckout();

    // Actualizamos el resumen de compra
    actualizarResumenCheckout();

    // Actualizamos el contador de productos
    actualizarContadorCheckout();

});
